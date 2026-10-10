
import jwt from "jsonwebtoken";
// Import thư viện jsonwebtoken để xác minh JSON Web Token (JWT).
// JWT được sử dụng để xác thực người dùng khi gửi yêu cầu tới backend.

import { User } from "../models/User.js";
// Import Model User để truy vấn thông tin tài khoản trong MongoDB.

// Middleware xác thực người dùng.
// Hàm này kiểm tra token trước khi cho phép người dùng truy cập API được bảo vệ.
export async function requireAuth(req, res, next) {
  try {
    // Lấy giá trị Authorization từ HTTP request header.
    const header = req.headers.authorization;

    // Kiểm tra header có bắt đầu bằng "Bearer " hay không.
    // Nếu đúng, lấy phần token phía sau "Bearer ".
    // Nếu không đúng định dạng, gán token bằng null.
    const token = header?.startsWith("Bearer ")
      ? header.slice(7)
      : null;

    // Nếu không có token, trả về HTTP 401 Unauthorized.
    // Điều này có nghĩa là yêu cầu chưa cung cấp thông tin xác thực hợp lệ.
    if (!token) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    // Xác minh chữ ký và thời hạn của JWT bằng JWT_SECRET.
    // Nếu token không hợp lệ hoặc hết hạn, jwt.verify() sẽ phát sinh lỗi.
    // payload chứa dữ liệu được mã hóa trong token sau khi xác minh thành công.
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm người dùng trong MongoDB theo ID được lưu trong payload.
    // select("-password") loại bỏ trường password khỏi kết quả truy vấn.
    const user = await User.findById(payload.id).select("-password");

    // Nếu không tìm thấy tài khoản tương ứng với ID trong token,
    // trả về HTTP 401 vì token không còn tương ứng với người dùng hợp lệ.
    if (!user) {
      return res.status(401).json({
        message: "Invalid token"
      });
    }

    // Kiểm tra tài khoản có bị quản trị viên khóa hay không.
    // Nếu đã bị khóa, trả về HTTP 403 Forbidden.
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
      });
    }

    // Gắn thông tin người dùng đã xác thực vào đối tượng request.
    // Các middleware hoặc controller tiếp theo có thể sử dụng req.user.
    req.user = user;

    // Chuyển quyền xử lý sang middleware hoặc controller tiếp theo.
    next();

  } catch {
    // Xử lý lỗi xác thực JWT hoặc lỗi phát sinh trong quá trình truy vấn.
    // Trả về HTTP 401 nếu token không hợp lệ, hết hạn hoặc xảy ra lỗi.
    res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

// Middleware kiểm tra quyền quản trị viên.
// Middleware này cần được đặt sau requireAuth trong tuyến API.
export function requireAdmin(req, res, next) {

  // Kiểm tra người dùng đã được xác thực có vai trò là admin hay không.
  // Nếu không có req.user hoặc role khác "admin", từ chối truy cập.
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  // Nếu người dùng có quyền admin, cho phép tiếp tục xử lý yêu cầu.
  next();
}
