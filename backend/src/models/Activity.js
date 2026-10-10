
import mongoose from "mongoose";
// Import thư viện Mongoose để định nghĩa cấu trúc dữ liệu
// và thao tác với MongoDB.

// Khai báo Schema lưu trữ hoạt động của người dùng trên website.
// Mỗi bản ghi tương ứng với một hoạt động được ghi nhận.
const activitySchema = new mongoose.Schema(
  {
    // ID của người dùng thực hiện hoạt động.
    // Liên kết tới collection User thông qua ObjectId.
    // index: true giúp tìm kiếm theo userId hiệu quả hơn.
    // Không bắt buộc vì hoạt động có thể thuộc khách chưa đăng nhập.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },

    // ID phiên truy cập của người dùng.
    // Bắt buộc để nhóm các hoạt động thuộc cùng một phiên.
    // Index hỗ trợ truy vấn lịch sử theo phiên truy cập.
    sessionId: {
      type: String,
      required: true,
      index: true
    },

    // Loại hoạt động được ghi nhận trên website.
    // enum giới hạn giá trị nhằm đảm bảo dữ liệu thống nhất.
    // required: true nghĩa là bắt buộc phải có loại hoạt động.
    type: {
      type: String,
      enum: [
        "page_view",   // Người dùng xem một trang.
        "click",       // Người dùng nhấn vào một thành phần.
        "search",      // Người dùng thực hiện tìm kiếm.
        "add_to_cart", // Người dùng thêm sản phẩm vào giỏ hàng.
        "checkout",    // Người dùng bắt đầu hoặc thực hiện thanh toán.
        "purchase"     // Người dùng hoàn tất mua hàng.
      ],
      required: true
    },

    // Đường dẫn trang mà người dùng đang truy cập.
    // Ví dụ: /products/nike-air-max
    // Trường này hỗ trợ phân tích trang được quan tâm nhiều.
    path: {
      type: String
    },

    // Nhóm thông tin bổ sung liên quan đến hoạt động.
    // Các trường bên trong không bắt buộc theo Schema hiện tại.
    metadata: {

      // ID sản phẩm liên quan đến hoạt động.
      // Liên kết tới collection Product.
      // Ví dụ: sản phẩm được xem hoặc thêm vào giỏ hàng.
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },

      // Từ khóa người dùng nhập khi tìm kiếm sản phẩm.
      // Hỗ trợ phân tích nhu cầu tìm kiếm của khách hàng.
      query: {
        type: String
      },

      // Nguồn truy cập, ví dụ Facebook hoặc Google.
      // Có thể dùng để thống kê nguồn mang khách hàng đến website.
      source: {
        type: String
      },

      // Loại thiết bị hoặc thông tin thiết bị được ghi nhận.
      // Ví dụ: desktop, mobile hoặc tablet.
      device: {
        type: String
      },

      // Thời gian người dùng ở lại trang, tính bằng mili giây (ms).
      // Ví dụ: 5000 tương đương 5 giây.
      duration: {
        type: Number
      }
    },

    // Địa chỉ IP được ghi nhận từ yêu cầu của người dùng.
    // Có thể hỗ trợ phân tích truy cập và phát hiện bất thường.
    ip: {
      type: String
    },

    // Chuỗi User-Agent do trình duyệt hoặc ứng dụng gửi lên.
    // Có thể hỗ trợ nhận diện trình duyệt và loại thiết bị.
    userAgent: {
      type: String
    }
  },

  // Tự động tạo hai trường createdAt và updatedAt.
  // createdAt: thời điểm tạo bản ghi hoạt động.
  // updatedAt: thời điểm bản ghi được cập nhật gần nhất.
  { timestamps: true }
);

// Tạo chỉ mục theo thời gian giảm dần.
// Hỗ trợ truy vấn hoạt động mới nhất trước.
activitySchema.index({ createdAt: -1 });

// Tạo chỉ mục kết hợp userId và type.
// Hỗ trợ truy vấn hoạt động theo người dùng và loại hoạt động,
// ví dụ tìm các lần tìm kiếm hoặc thêm giỏ hàng của một tài khoản.
activitySchema.index({ userId: 1, type: 1 });

// Tạo và xuất Model Activity từ Schema đã khai báo.
// Các module khác có thể import Model này để tạo, truy vấn,
// cập nhật hoặc xóa bản ghi hoạt động trong MongoDB.
export const Activity = mongoose.model("Activity", activitySchema);
