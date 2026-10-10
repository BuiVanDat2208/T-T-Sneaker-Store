
import mongoose from "mongoose";
// Import thư viện Mongoose để định nghĩa Schema
// và thao tác với cơ sở dữ liệu MongoDB.

// Khai báo Schema lưu trữ các cấu hình của hệ thống.
const settingSchema = new mongoose.Schema(
  {
    // Khóa định danh của cấu hình.
    // Ví dụ: "ai_tools", "site_name", "maintenance_mode".
    // required: true: bắt buộc phải có khóa cấu hình.
    // unique: true: yêu cầu mỗi khóa chỉ có một bản ghi
    // khi chỉ mục duy nhất đã được tạo thành công.
    key: {
      type: String,
      required: true,
      unique: true
    },

    // Giá trị tương ứng với khóa cấu hình.
    // Sử dụng Schema.Types.Mixed để lưu dữ liệu linh hoạt,
    // chẳng hạn chuỗi, số, Boolean, mảng hoặc đối tượng.
    // required: true: bắt buộc phải có giá trị cấu hình.
    //
    // Ví dụ, với key = "ai_tools", value có thể là:
    // {
    //   search_products: true,
    //   get_order_status: false
    // }
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },

    // Mô tả mục đích sử dụng của cấu hình.
    // Trường này không bắt buộc.
    // Ví dụ: mô tả các công cụ AI được phép sử dụng.
    description: {
      type: String
    }
  },

  // Tự động tạo hai trường thời gian:
  // createdAt: thời điểm tạo cấu hình.
  // updatedAt: thời điểm cập nhật cấu hình gần nhất.
  { timestamps: true }
);

// Tạo Model Setting từ settingSchema.
// Model được dùng để thêm, truy vấn, cập nhật
// hoặc xóa các cấu hình trong MongoDB.
export const Setting = mongoose.model("Setting", settingSchema);
