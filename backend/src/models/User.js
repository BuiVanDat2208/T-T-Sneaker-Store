
import bcrypt from "bcryptjs";
// Import thư viện bcryptjs để băm mật khẩu và so sánh mật khẩu.
// Mật khẩu được băm trước khi lưu vào cơ sở dữ liệu,
// thay vì lưu trực tiếp dưới dạng văn bản thuần.

import mongoose from "mongoose";
// Import thư viện Mongoose để định nghĩa Schema
// và thao tác với MongoDB.

// Khai báo Schema mô tả cấu trúc dữ liệu người dùng.
const userSchema = new mongoose.Schema(
  {
    // Họ tên người dùng.
    // required: true: bắt buộc phải có tên.
    // trim: true: loại bỏ khoảng trắng ở đầu và cuối chuỗi.
    name: {
      type: String,
      required: true,
      trim: true
    },

    // Địa chỉ email dùng để định danh tài khoản.
    // required: true: bắt buộc phải có email.
    // unique: true: yêu cầu email không trùng lặp
    // khi chỉ mục duy nhất đã được tạo thành công.
    // lowercase: true: chuyển email thành chữ thường.
    // trim: true: loại bỏ khoảng trắng ở đầu và cuối email.
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // Mật khẩu của người dùng.
    // required: true: bắt buộc phải có mật khẩu.
    // minlength: 6: yêu cầu độ dài tối thiểu 6 ký tự
    // khi Mongoose thực hiện kiểm tra hợp lệ.
    // select: false: mặc định loại trường password
    // khỏi kết quả truy vấn thông thường.
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    // Vai trò của người dùng trong hệ thống.
    // admin: quản trị viên.
    // customer: khách hàng.
    // enum giới hạn các giá trị hợp lệ.
    // Nếu không cung cấp, mặc định là customer.
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer"
    },

    // Địa chỉ của người dùng.
    // Nếu không cung cấp, mặc định là chuỗi rỗng.
    address: {
      type: String,
      default: ""
    },

    // Số điện thoại của người dùng.
    // Nếu không cung cấp, mặc định là chuỗi rỗng.
    phone: {
      type: String,
      default: ""
    },

    // Trạng thái khóa tài khoản.
    // true: tài khoản bị khóa.
    // false: tài khoản không bị khóa.
    // Mặc định là false.
    isBlocked: {
      type: Boolean,
      default: false
    }
  },

  // Tự động tạo hai trường thời gian:
  // createdAt: thời điểm tạo tài khoản.
  // updatedAt: thời điểm cập nhật tài khoản gần nhất.
  { timestamps: true }
);

// Đăng ký middleware pre("save") để băm mật khẩu
// trước khi lưu tài liệu User vào MongoDB.
userSchema.pre("save", async function hashPassword(next) {

  // Kiểm tra trường password có bị thay đổi hay không.
  // Nếu không thay đổi, bỏ qua việc băm lại mật khẩu
  // để tránh băm nhầm giá trị đã được băm trước đó.
  if (!this.isModified("password")) {
    return next();
  }

  // Băm mật khẩu bằng bcrypt với cost factor bằng 12.
  // Giá trị 12 điều chỉnh mức độ tính toán của quá trình băm.
  // Mỗi lần băm có salt riêng do bcrypt quản lý.
  // Kết quả băm được lưu thay cho mật khẩu ban đầu.
  this.password = await bcrypt.hash(this.password, 12);

  // Chuyển sang bước tiếp theo của quá trình lưu.
  next();
});

// Khai báo phương thức so sánh mật khẩu cho Model User.
// candidate là mật khẩu người dùng nhập khi đăng nhập.
userSchema.methods.comparePassword = function comparePassword(candidate) {

  // So sánh mật khẩu nhập vào với mật khẩu đã băm.
  // bcrypt.compare() trả về Promise chứa true hoặc false.
  // Không cần tự giải mã mật khẩu đã băm.
  return bcrypt.compare(candidate, this.password);
};

// Tạo và xuất Model User từ userSchema.
// Model được sử dụng để tạo tài khoản, truy vấn người dùng,
// cập nhật thông tin và thực hiện các thao tác liên quan.
export const User = mongoose.model("User", userSchema);
