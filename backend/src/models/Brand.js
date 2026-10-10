
import mongoose from "mongoose";
// Import thư viện Mongoose để định nghĩa cấu trúc dữ liệu
// và thao tác với cơ sở dữ liệu MongoDB.

// Khai báo Schema cho thương hiệu sản phẩm.
// Schema quy định các trường dữ liệu của một thương hiệu.
const brandSchema = new mongoose.Schema(
  {
    // Tên thương hiệu, ví dụ: Nike, Adidas, Puma.
    // required: true nghĩa là bắt buộc phải có tên thương hiệu.
    // trim: true tự động loại bỏ khoảng trắng ở đầu và cuối chuỗi.
    name: {
      type: String,
      required: true,
      trim: true
    },

    // Đường dẫn định danh thân thiện với SEO của thương hiệu.
    // Ví dụ: "Nike", "Nike " có thể được chuẩn hóa thành "nike"
    // nếu ứng dụng chuyển đổi slug trước khi lưu.
    // required: true: bắt buộc phải có slug.
    // unique: true: yêu cầu giá trị slug không trùng lặp trong collection.
    // lowercase: true: chuyển chuỗi thành chữ thường.
    // trim: true: loại bỏ khoảng trắng ở đầu và cuối chuỗi.
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // Phần mô tả thông tin về thương hiệu.
    // Không bắt buộc, cho phép lưu nội dung giới thiệu thương hiệu.
    // trim: true giúp loại bỏ khoảng trắng ở đầu và cuối.
    description: {
      type: String,
      trim: true
    },

    // Đường dẫn URL của logo thương hiệu.
    // Nếu không cung cấp logo, giá trị mặc định là chuỗi rỗng.
    // Ví dụ: URL ảnh logo được lưu trên Cloudinary.
    logo: {
      type: String,
      default: ""
    }
  },

  // Tự động tạo hai trường thời gian:
  // createdAt: thời điểm tạo bản ghi thương hiệu.
  // updatedAt: thời điểm cập nhật bản ghi gần nhất.
  { timestamps: true }
);

// Tạo Model Brand từ brandSchema.
// Model này được sử dụng để thêm, truy vấn, cập nhật
// hoặc xóa dữ liệu thương hiệu trong MongoDB.
export const Brand = mongoose.model("Brand", brandSchema);
