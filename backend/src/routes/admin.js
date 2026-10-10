
import { Router } from "express";

// Import middleware xác thực đăng nhập và kiểm tra quyền admin.
import { requireAdmin, requireAuth } from "../middleware/auth.js";

// Import các Model dùng để truy vấn dữ liệu thống kê.
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Activity } from "../models/Activity.js";
import { Setting } from "../models/Setting.js";

// Khởi tạo Router để khai báo các API quản trị.
const router = Router();

// ============================================================
// API 1: THỐNG KÊ DASHBOARD QUẢN TRỊ
// GET /stats
// ============================================================

// requireAuth: xác thực người dùng bằng JWT.
// requireAdmin: chỉ cho phép tài khoản có role = "admin" truy cập.
router.get("/stats", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // --------------------------------------------------------
    // 1. TỔNG HỢP CÁC CHỈ SỐ CƠ BẢN
    // --------------------------------------------------------

    // Tính tổng giá trị đơn hàng không bị hủy.
    // $match: lọc các đơn có status khác "cancelled".
    // $group: nhóm các đơn hàng và cộng trường totalAmount.
    // Lưu ý: cách tính này vẫn bao gồm đơn chưa thanh toán.
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    // Đếm tổng số đơn hàng trong collection Order.
    // Bao gồm cả đơn đã hủy.
    const ordersCount = await Order.countDocuments();

    // Đếm tổng số sản phẩm.
    // Bao gồm sản phẩm active, draft và archived.
    const productsCount = await Product.countDocuments();

    // Đếm số tài khoản khách hàng.
    // Model User của dự án sử dụng role "customer",
    // không phải role "user".
    const customersCount = await User.countDocuments({
      role: "customer"
    });

    // --------------------------------------------------------
    // 2. THỐNG KÊ DOANH THU THEO THÁNG
    // Lấy dữ liệu từ tháng hiện tại và 5 tháng trước đó.
    // --------------------------------------------------------

    const sixMonthsAgo = new Date();

    // Lùi về 5 tháng trước tháng hiện tại.
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    // Đưa ngày về ngày đầu tiên của tháng.
    // Ví dụ: nếu hiện tại là 10/10 thì mốc bắt đầu là 01/05.
    sixMonthsAgo.setDate(1);

    // Nhóm các đơn hàng theo năm và tháng tạo đơn.
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },

          // Loại trừ các đơn hàng đã hủy.
          // Những đơn chưa thanh toán vẫn được tính theo logic hiện tại.
          status: { $ne: "cancelled" }
        }
      },
      {
        $group: {
          // Nhóm theo năm và tháng của createdAt.
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },

          // Cộng tổng giá trị đơn hàng của từng tháng.
          revenue: { $sum: "$totalAmount" }
        }
      },

      // Sắp xếp theo năm tăng dần, sau đó theo tháng tăng dần.
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Chuyển dữ liệu MongoDB thành cấu trúc phù hợp với biểu đồ.
    // Ví dụ: { label: "T10/2026", revenue: 15000000 }
    const chartData = monthlyRevenue.map((item) => ({
      label: `T${item._id.month}/${item._id.year}`,
      revenue: item.revenue
    }));

    // --------------------------------------------------------
    // 3. THỐNG KÊ 5 TRANG SẢN PHẨM ĐƯỢC XEM NHIỀU NHẤT
    // --------------------------------------------------------

    // Model Activity đang lưu đường dẫn trang trong trường "path".
    // Vì vậy, sử dụng path thay vì metadata.url.
    const topViewedProducts = await Activity.aggregate([
      {
        $match: {
          // Chỉ lấy sự kiện xem trang sản phẩm.
          type: "page_view",

          // Chỉ lấy các đường dẫn bắt đầu bằng /products/.
          path: { $regex: "^/products/" }
        }
      },
      {
        $group: {
          // Gom các lượt xem theo đường dẫn sản phẩm.
          _id: "$path",

          // Đếm số lượt xem của mỗi đường dẫn.
          views: { $sum: 1 }
        }
      },

      // Sắp xếp sản phẩm có lượt xem cao nhất lên đầu.
      { $sort: { views: -1 } },

      // Chỉ lấy 5 kết quả đầu tiên.
      { $limit: 5 }
    ]);

    // --------------------------------------------------------
    // 4. LẤY XU HƯỚNG TÌM KIẾM TỪ SERPAPI
    // --------------------------------------------------------

    // Khởi tạo mảng rỗng để lưu dữ liệu xu hướng tìm kiếm.
    let searchTrends = [];

    // Đọc API Key SerpApi từ biến môi trường.
    const serpapiKey = process.env.SERPAPI_API_KEY;

    // Chỉ gọi SerpApi nếu đã cấu hình API Key.
    if (serpapiKey) {
      try {
        // Gửi yêu cầu lấy dữ liệu Google Trends theo thời gian thực.
        // geo=VN: giới hạn khu vực Việt Nam.
        const response = await fetch(
          `https://serpapi.com/search.json?engine=google_trends_trending_now&frequency=realtime&geo=VN&api_key=${encodeURIComponent(serpapiKey)}`
        );

        // Chỉ xử lý nội dung khi HTTP response thành công.
        if (response.ok) {
          const serpData = await response.json();

          // Kiểm tra dữ liệu trả về có danh sách xu hướng hay không.
          if (
            Array.isArray(serpData.trending_searches)
          ) {
            // Lấy tối đa 6 xu hướng đầu tiên.
            searchTrends = serpData.trending_searches
              .slice(0, 6)
              .map((item) => ({
                // Từ khóa đang được tìm kiếm.
                query: item.query,

                // Giá trị lượt tìm kiếm theo dữ liệu API.
                // Nếu không có, sử dụng nhãn dự phòng.
                views: item.formatted_value || "Chưa có dữ liệu",

                // Liên kết xem thêm.
                // Nếu API không cung cấp link, tạo URL tìm kiếm Google.
                link:
                  item.link ||
                  `https://www.google.com/search?q=${encodeURIComponent(item.query)}`
              }));
          }
        } else {
          // Ghi lại lỗi HTTP nếu SerpApi phản hồi không thành công.
          console.error(
            "SerpApi returned HTTP status:",
            response.status
          );
        }
      } catch (err) {
        // Ghi lại lỗi mạng hoặc lỗi khi đọc dữ liệu API.
        console.error("Failed to fetch SerpApi Google Trends:", err);
      }
    }

    // --------------------------------------------------------
    // 5. DỮ LIỆU DỰ PHÒNG KHI KHÔNG LẤY ĐƯỢC GOOGLE TRENDS
    // --------------------------------------------------------

    // Nếu không có API Key, API thất bại hoặc không có dữ liệu,
    // sử dụng danh sách từ khóa mẫu để giao diện không bị trống.
    // Đây là dữ liệu minh họa, không phải xu hướng trực tiếp.
    if (searchTrends.length === 0) {
      searchTrends = [
        {
          query: "Nike Air Force 1",
          views: "Dữ liệu mẫu #1",
          link: "https://www.google.com/search?q=Nike+Air+Force+1"
        },
        {
          query: "Adidas Samba",
          views: "Dữ liệu mẫu #2",
          link: "https://www.google.com/search?q=Adidas+Samba"
        },
        {
          query: "New Balance 550",
          views: "Dữ liệu mẫu #3",
          link: "https://www.google.com/search?q=New+Balance+550"
        },
        {
          query: "Adidas Gazelle",
          views: "Dữ liệu mẫu #4",
          link: "https://www.google.com/search?q=Adidas+Gazelle"
        },
        {
          query: "Nike Air Jordan 1",
          views: "Dữ liệu mẫu #5",
          link: "https://www.google.com/search?q=Nike+Air+Jordan+1"
        },
        {
          query: "Puma Palermo",
          views: "Dữ liệu mẫu #6",
          link: "https://www.google.com/search?q=Puma+Palermo"
        }
      ];
    }

    // --------------------------------------------------------
    // 6. TRẢ DỮ LIỆU DASHBOARD VỀ CLIENT
    // --------------------------------------------------------

    res.json({
      stats: {
        // Lấy tổng doanh thu; nếu chưa có dữ liệu thì trả về 0.
        revenue: totalRevenue[0]?.total || 0,

        // Tổng số đơn hàng.
        orders: ordersCount,

        // Tổng số sản phẩm.
        products: productsCount,

        // Tổng số tài khoản khách hàng.
        customers: customersCount,

        // Đếm lượt xem trang trong 24 giờ gần nhất.
        pageViews24h: await Activity.countDocuments({
          type: "page_view",
          createdAt: {
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        })
      },

      // Dữ liệu doanh thu theo tháng cho biểu đồ.
      chartData,

      // Danh sách 5 đường dẫn sản phẩm được xem nhiều nhất.
      topViewedProducts,

      // Xu hướng tìm kiếm thực tế hoặc dữ liệu mẫu dự phòng.
      searchTrends
    });
  } catch (error) {
    // Chuyển lỗi sang middleware xử lý lỗi tập trung của Express.
    next(error);
  }
});

// ============================================================
// API 2: LẤY CẤU HÌNH CÔNG CỤ AI
// GET /settings/ai
// ============================================================

router.get(
  "/settings/ai",
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      // Tìm cấu hình có key là "ai_tools".
      let settings = await Setting.findOne({
        key: "ai_tools"
      });

      // Nếu chưa tồn tại cấu hình, tạo cấu hình mặc định.
      if (!settings) {
        settings = await Setting.create({
          key: "ai_tools",
          value: {
            search_products: true,
            get_order_status: true
          }
        });
      }

      // Chỉ trả phần value chứa cấu hình cho client.
      res.json(settings.value);
    } catch (error) {
      // Chuyển lỗi sang middleware xử lý lỗi tập trung.
      next(error);
    }
  }
);

// ============================================================
// API 3: CẬP NHẬT CẤU HÌNH CÔNG CỤ AI
// POST /settings/ai
// ============================================================

router.post(
  "/settings/ai",
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      // Lấy đối tượng cấu hình từ phần thân HTTP request.
      const { value } = req.body;

      // Tìm cấu hình "ai_tools" và cập nhật giá trị.
      // upsert: true: tạo mới nếu cấu hình chưa tồn tại.
      // new: true: trả về tài liệu sau khi cập nhật.
      const settings = await Setting.findOneAndUpdate(
        { key: "ai_tools" },
        { value },
        {
          upsert: true,
          new: true
        }
      );

      // Trả cấu hình đã lưu về client.
      res.json(settings.value);
    } catch (error) {
      // Chuyển lỗi sang middleware xử lý lỗi tập trung.
      next(error);
    }
  }
);

// Xuất Router để file app.js hoặc server.js đăng ký sử dụng.
export default router;
