
import { Router } from "express";
// Import Router từ Express để khai báo các API phân tích hành vi.

import { Activity } from "../models/Activity.js";
// Import Model Activity để lưu và truy vấn dữ liệu hành vi người dùng.

// Khởi tạo Router để định nghĩa các endpoint analytics.
const router = Router();

// ============================================================
// API 1: GHI NHẬN HÀNH VI NGƯỜI DÙNG
// POST /log
// ============================================================

// Endpoint công khai, cho phép ghi nhận hành vi
// ngay cả khi người dùng chưa đăng nhập.
router.post("/log", async (req, res, next) => {
  try {
    // Lấy dữ liệu hành vi từ phần thân HTTP request.
    // type: loại hoạt động, ví dụ page_view hoặc search.
    // path: đường dẫn trang người dùng truy cập.
    // metadata: thông tin bổ sung như productId hoặc từ khóa.
    // sessionId: mã phiên truy cập.
    // userId: ID người dùng nếu đã đăng nhập.
    const {
      type,
      path,
      metadata,
      sessionId,
      userId
    } = req.body;

    // Tạo bản ghi hoạt động mới trong MongoDB.
    const activity = await Activity.create({

      // Lưu ID người dùng nếu được cung cấp.
      // Nếu không có thì lưu null, phù hợp với khách chưa đăng nhập.
      //
      // Lưu ý: trong hệ thống thực tế, userId của người đã đăng nhập
      // nên được lấy từ thông tin xác thực phía server,
      // không nên tin trực tiếp ID do client gửi lên.
      userId: userId || null,

      // Lưu mã phiên truy cập để nhóm các hành vi cùng phiên.
      sessionId,

      // Lưu loại hành vi.
      type,

      // Lưu đường dẫn trang được ghi nhận.
      path,

      // Lưu thông tin bổ sung liên quan đến hành vi.
      metadata,

      // Lấy địa chỉ IP từ request để hỗ trợ phân tích truy cập.
      // Cần cấu hình trust proxy đúng nếu backend chạy sau proxy.
      ip: req.ip,

      // Lưu chuỗi User-Agent do trình duyệt gửi lên.
      // Có thể hỗ trợ phân tích loại trình duyệt và thiết bị.
      userAgent: req.headers["user-agent"]
    });

    // Trả về HTTP 201 khi bản ghi được tạo thành công.
    // Client chỉ nhận thông báo thành công, không nhận toàn bộ bản ghi.
    res.status(201).json({
      success: true
    });

  } catch (error) {
    // Ghi lỗi vào console để hỗ trợ kiểm tra khi phát triển.
    console.error("Analytics Error:", error);

    // Trả về HTTP 500 nếu việc ghi nhận hoạt động thất bại.
    // Theo thiết kế hiện tại, lỗi analytics không được chuyển
    // tới giao diện dưới dạng chi tiết lỗi nội bộ.
    res.status(500).json({
      success: false
    });
  }
});

// ============================================================
// API 2: THỐNG KÊ SẢN PHẨM ĐƯỢC XEM NHIỀU
// GET /summary
// ============================================================

// Endpoint truy vấn dữ liệu hành vi để phục vụ dashboard
// hoặc các chức năng phân tích dữ liệu về sau.
//
// Lưu ý: code hiện tại chưa kiểm tra quyền Admin cho endpoint này.
router.get("/summary", async (req, res, next) => {
  try {
    // Sử dụng MongoDB Aggregation để thống kê lượt xem sản phẩm.
    const topProducts = await Activity.aggregate([

      // Bước 1: Lọc các hoạt động xem trang sản phẩm.
      // Chỉ lấy bản ghi có type = "page_view"
      // và metadata.productId tồn tại.
      {
        $match: {
          type: "page_view",
          "metadata.productId": {
            $exists: true
          }
        }
      },

      // Bước 2: Nhóm dữ liệu theo ID sản phẩm.
      // _id là productId của nhóm.
      // views đếm số bản ghi xem trang của từng sản phẩm.
      {
        $group: {
          _id: "$metadata.productId",
          views: {
            $sum: 1
          }
        }
      },

      // Bước 3: Sắp xếp theo số lượt xem giảm dần.
      // Sản phẩm có nhiều lượt xem sẽ đứng trước.
      {
        $sort: {
          views: -1
        }
      },

      // Bước 4: Giới hạn kết quả ở 10 sản phẩm.
      {
        $limit: 10
      },

      // Bước 5: Kết hợp dữ liệu thống kê với collection products.
      {
        $lookup: {
          from: "products",       // Tên collection sản phẩm trong MongoDB.
          localField: "_id",      // ID sản phẩm trong kết quả thống kê.
          foreignField: "_id",    // ID tương ứng trong collection products.
          as: "product"           // Mảng chứa thông tin sản phẩm tìm thấy.
        }
      }

      // Sau bước $lookup, mỗi kết quả có:
      // _id: ID sản phẩm.
      // views: số lượt xem.
      // product: mảng thông tin sản phẩm khớp với ID.
    ]);

    // Trả kết quả thống kê về client dưới dạng JSON.
    res.json({
      topProducts
    });

  } catch (error) {
    // Chuyển lỗi sang middleware xử lý lỗi tập trung của Express.
    next(error);
  }
});

// Xuất Router để file app.js hoặc server.js đăng ký sử dụng.
export default router;
