
import { ZodError } from "zod";
// Import ZodError để nhận diện lỗi phát sinh khi kiểm tra,
// xác thực dữ liệu bằng thư viện Zod.

// Middleware xử lý trường hợp người dùng truy cập API không tồn tại.
export function notFound(req, res) {

  // Trả về mã HTTP 404 (Not Found) khi không tìm thấy tuyến API.
  // req.originalUrl chứa đường dẫn đầy đủ mà client đã yêu cầu.
  // Đường dẫn được đưa vào thông báo để hỗ trợ xác định API bị gọi sai.
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`
  });
}

// Middleware xử lý lỗi tập trung trong ứng dụng Express.
// Tham số error chứa thông tin lỗi được chuyển đến middleware này.
// req là yêu cầu từ client, res là phản hồi từ server,
// next cho phép chuyển tiếp lỗi sang middleware khác nếu cần.
export function errorHandler(error, req, res, next) {

  // Kiểm tra lỗi có phải là lỗi xác thực dữ liệu của Zod hay không.
  if (error instanceof ZodError) {

    // Nếu dữ liệu không hợp lệ, trả về HTTP 400 (Bad Request).
    return res.status(400).json({

      // Lấy thông báo lỗi từ từng mục trong error.issues,
      // sau đó ghép các thông báo thành một chuỗi, ngăn cách bằng dấu phẩy.
      // Giúp client biết những dữ liệu nào chưa đáp ứng yêu cầu.
      message: error.issues
        .map((issue) => issue.message)
        .join(", ")
    });
  }

  // Lấy mã trạng thái HTTP từ thuộc tính status của lỗi.
  // Nếu lỗi không có status, mặc định sử dụng mã 500.
  const status = error.status || 500;

  // Nếu mã trạng thái từ 500 trở lên, đây thường là lỗi phía server.
  // Ghi lại thông tin lỗi trong console để hỗ trợ việc kiểm tra,
  // chẩn đoán và sửa lỗi trong quá trình phát triển.
  if (status >= 500) {
    console.error("Request failed:", error);
  }

  // Trả về phản hồi JSON chứa thông báo lỗi.
  res.status(status).json({

    // Với lỗi server (500 trở lên), chỉ trả thông báo chung
    // nhằm tránh để lộ chi tiết nội bộ của hệ thống.
    //
    // Với lỗi có mã dưới 500, trả thông báo lỗi cụ thể nếu có.
    // Nếu không có message, sử dụng thông báo mặc định.
    message: status >= 500
      ? "Internal server error"
      : error.message || "Request failed"
  });
}
