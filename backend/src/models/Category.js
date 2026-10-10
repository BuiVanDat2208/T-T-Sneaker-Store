
import mongoose from "mongoose";
// Import thư viện Mongoose để định nghĩa cấu trúc dữ liệu
// và thao tác với cơ sở dữ liệu MongoDB.

// Khai báo Schema cho danh mục sản phẩm.
// Schema quy định các trường dữ liệu của một danh mục.
const categorySchema = new mongoose.Schema(
  {
    // Tên danh mục sản phẩm, ví dụ: Giày thể thao, Giày chạy bộ.
    // required: true nghĩa là trường này bắt buộc phải có dữ liệu.
    // trim: true tự động loại bỏ khoảng trắng ở đầu và cuối chuỗi.
    name: {
      type: String,
      required: true,
      trim: true
    },

    // Slug là chuỗi định danh thân thiện với URL.
    // Ví dụ: "Giày chạy bộ" có thể được chuyển thành "giay-chay-bo"
    // nếu ứng dụng triển khai chức năng tạo slug tương ứng.
    // required: true: bắt buộc phải có slug.
    // unique: true: yêu cầu slug không trùng lặp trong collection.
    // lowercase: true: chuyển chuỗi thành chữ thường.
    // trim: true: loại bỏ khoảng trắng ở đầu và cuối chuỗi.
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // Mô tả thông tin của danh mục sản phẩm.
    // Trường này không bắt buộc, có thể để trống.
    // trim: true giúp loại bỏ khoảng trắng ở đầu và cuối chuỗi.
    description: {
      type: String,
      trim: true
    }
  },

  // Tự động tạo hai trường thời gian:
  // createdAt: thời điểm tạo danh mục.
  // updatedAt: thời điểm cập nhật danh mục gần nhất.
  { timestamps: true }
);

// Tạo Model Category từ categorySchema.
// Model được sử dụng để thêm, truy vấn, cập nhật
// hoặc xóa danh mục trong MongoDB.
export const Category = mongoose.model("Category", categorySchema);
