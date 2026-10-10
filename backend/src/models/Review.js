
import mongoose from "mongoose";
// Import thư viện Mongoose để định nghĩa Schema
// và thao tác với cơ sở dữ liệu MongoDB.

// Khai báo Schema lưu trữ đánh giá sản phẩm của người dùng.
const reviewSchema = new mongoose.Schema(
  {
    // ID sản phẩm được đánh giá.
    // ref: "Product" liên kết tới Model Product.
    // required: true nghĩa là bắt buộc phải có sản phẩm.
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    // ID người dùng viết đánh giá.
    // ref: "User" liên kết tới Model User.
    // required: true nghĩa là mỗi đánh giá phải có người dùng.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Điểm đánh giá sản phẩm theo thang điểm từ 1 đến 5.
    // required: true: bắt buộc phải có điểm đánh giá.
    // min: 1: điểm thấp nhất là 1.
    // max: 5: điểm cao nhất là 5.
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    // Nội dung nhận xét của người dùng về sản phẩm.
    // required: true: bắt buộc phải có nội dung đánh giá.
    // trim: true: tự động loại bỏ khoảng trắng ở đầu và cuối chuỗi.
    comment: {
      type: String,
      required: true,
      trim: true
    }
  },

  // Tự động tạo hai trường thời gian:
  // createdAt: thời điểm tạo đánh giá.
  // updatedAt: thời điểm cập nhật đánh giá gần nhất.
  { timestamps: true }
);

// Tạo chỉ mục kết hợp giữa productId và userId.
// unique: true yêu cầu mỗi cặp sản phẩm - người dùng chỉ xuất hiện
// một lần trong collection Review khi chỉ mục đã được tạo thành công.
// Nhờ đó, một người dùng không thể tạo nhiều bản ghi đánh giá
// cho cùng một sản phẩm bằng các thao tác ghi thông thường.
reviewSchema.index(
  { productId: 1, userId: 1 },
  { unique: true }
);

// Tạo Model Review từ reviewSchema.
// Model được sử dụng để thêm, truy vấn, cập nhật
// hoặc xóa đánh giá sản phẩm trong MongoDB.
export const Review = mongoose.model("Review", reviewSchema);
