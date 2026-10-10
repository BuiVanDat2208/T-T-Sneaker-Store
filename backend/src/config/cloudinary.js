
import { v2 as cloudinary } from "cloudinary";

// Hàm cấu hình kết nối với dịch vụ Cloudinary
// Cloudinary được sử dụng để lưu trữ và quản lý hình ảnh trực tuyến.
export function configureCloudinary() {

  // Kiểm tra xem biến môi trường CLOUDINARY_CLOUD_NAME
  // đã được khai báo hay chưa.
  // Nếu chưa có tên Cloudinary Cloud thì không thực hiện cấu hình
  // và trả về null để thông báo rằng Cloudinary chưa sẵn sàng.
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return null;
  }

  // Thiết lập thông tin xác thực để kết nối với Cloudinary.
  cloudinary.config({
    // Tên Cloudinary Cloud dùng để xác định tài khoản lưu trữ.
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

    // API Key dùng để xác định ứng dụng khi gọi API Cloudinary.
    api_key: process.env.CLOUDINARY_API_KEY,

    // API Secret dùng để xác thực các yêu cầu cần bảo mật.
    // Giá trị này phải được giữ bí mật trong biến môi trường.
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  // Trả về đối tượng Cloudinary đã được cấu hình,
  // giúp các phần khác của backend sử dụng để tải lên,
  // quản lý hoặc xử lý hình ảnh.
  return cloudinary;
}
