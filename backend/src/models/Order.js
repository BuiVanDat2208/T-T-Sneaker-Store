
import mongoose from "mongoose";
// Import thư viện Mongoose để định nghĩa Schema và thao tác với MongoDB.

// Khai báo Schema cho từng sản phẩm nằm trong đơn hàng.
// Schema này được sử dụng bên trong orderSchema thông qua mảng items.
const orderItemSchema = new mongoose.Schema(
  {
    // ID của sản phẩm trong cơ sở dữ liệu.
    // ref: "Product" xác định Model Product được liên kết.
    // required: true nghĩa là bắt buộc phải có ID sản phẩm.
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    // Lưu tên sản phẩm tại thời điểm đặt hàng.
    // Dữ liệu này giúp giữ lại tên sản phẩm trong đơn hàng
    // ngay cả khi tên sản phẩm trong danh mục được thay đổi.
    name: {
      type: String,
      required: true
    },

    // Lưu đường dẫn hình ảnh sản phẩm tại thời điểm đặt hàng.
    // Bắt buộc phải có đường dẫn hình ảnh.
    image: {
      type: String,
      required: true
    },

    // Số lượng sản phẩm được đặt mua.
    // required: true: bắt buộc phải có số lượng.
    // min: 1: số lượng không được nhỏ hơn 1.
    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    // Kích cỡ giày được khách hàng lựa chọn.
    // Ví dụ: 38, 39, 40 hoặc 42.
    // Schema hiện tại yêu cầu kích cỡ được biểu diễn bằng số.
    size: {
      type: Number,
      required: true
    },

    // Đơn giá của sản phẩm tại thời điểm đặt hàng.
    // required: true: bắt buộc phải có giá.
    // min: 0: giá không được nhỏ hơn 0.
    price: {
      type: Number,
      required: true,
      min: 0
    }
  },

  // Không tự động tạo trường _id riêng cho từng phần tử items.
  // Phù hợp khi không cần định danh riêng cho từng dòng sản phẩm.
  { _id: false }
);

// Khai báo Schema cho đơn hàng.
const orderSchema = new mongoose.Schema(
  {
    // ID của người dùng tạo đơn hàng.
    // ref: "User" liên kết tới Model User.
    // required: true: mỗi đơn hàng phải thuộc về một tài khoản.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Danh sách sản phẩm có trong đơn hàng.
    // Mỗi phần tử tuân theo cấu trúc orderItemSchema.
    items: [orderItemSchema],

    // Tổng tiền hàng của đơn hàng theo cách tính của ứng dụng.
    // required: true: bắt buộc phải có giá trị.
    // min: 0: tổng tiền không được nhỏ hơn 0.
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    // Địa chỉ nhận hàng của khách hàng.
    // Bắt buộc phải có địa chỉ giao hàng.
    shippingAddress: {
      type: String,
      required: true
    },

    // Số điện thoại liên hệ nhận hàng.
    // required: false: không bắt buộc theo Schema này.
    phone: {
      type: String,
      required: false
    },

    // Phương thức vận chuyển được lựa chọn.
    // Nếu không cung cấp, mặc định sử dụng "standard".
    // Các giá trị được phép khác cần được xử lý ở nghiệp vụ vận chuyển.
    shippingMethod: {
      type: String,
      default: "standard"
    },

    // Phí vận chuyển của đơn hàng.
    // Nếu không cung cấp, mặc định là 0.
    shippingFee: {
      type: Number,
      default: 0
    },

    // Phương thức thanh toán được sử dụng cho đơn hàng.
    // enum giới hạn vào bốn phương thức được khai báo:
    // cod: thanh toán khi nhận hàng.
    // stripe: thanh toán qua Stripe.
    // vnpay: thanh toán qua VNPay.
    // sepay: thanh toán qua SePay.
    // required: true: bắt buộc phải xác định phương thức thanh toán.
    paymentMethod: {
      type: String,
      enum: ["cod", "stripe", "vnpay", "sepay"],
      required: true
    },

    // Trạng thái thanh toán của đơn hàng.
    // Chỉ chấp nhận "unpaid" hoặc "paid".
    // Nếu chưa chỉ định, mặc định là "unpaid".
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid"
    },

    // Lưu thông tin thanh toán bổ sung dưới dạng dữ liệu linh hoạt.
    // Mixed cho phép lưu nhiều dạng dữ liệu khác nhau,
    // ví dụ mã giao dịch hoặc thông tin phản hồi từ cổng thanh toán.
    // Trường này không bắt buộc.
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed
    },

    // Mã số đơn hàng dùng để tra cứu hoặc hiển thị.
    // unique: true: yêu cầu giá trị orderCode không trùng lặp.
    // sparse: true: chỉ áp dụng chỉ mục duy nhất cho các bản ghi
    // có trường orderCode tồn tại trong chỉ mục.
    // Trường này không bắt buộc theo Schema.
    orderCode: {
      type: Number,
      unique: true,
      sparse: true
    },

    // Trạng thái xử lý đơn hàng trong quá trình mua bán.
    // pending: đơn hàng mới được tạo, đang chờ xử lý.
    // processing: đơn hàng đang được xử lý.
    // shipped: đơn hàng đã được gửi đi.
    // delivered: đơn hàng đã được giao.
    // cancelled: đơn hàng đã bị hủy.
    // Nếu không cung cấp trạng thái, mặc định là pending.
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
      ],
      default: "pending"
    }
  },

  // Tự động tạo hai trường thời gian:
  // createdAt: thời điểm tạo đơn hàng.
  // updatedAt: thời điểm cập nhật đơn hàng gần nhất.
  { timestamps: true }
);

// Tạo Model Order từ orderSchema.
// Model được sử dụng để tạo, truy vấn, cập nhật
// và quản lý đơn hàng trong MongoDB.
export const Order = mongoose.model("Order", orderSchema);
