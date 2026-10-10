
import { Router } from "express"; // Import Router để khai báo các API xác thực riêng.
import { z } from "zod"; // Import Zod để kiểm tra và chuẩn hóa dữ liệu đầu vào.
import { User } from "../models/User.js"; // Import model User để thao tác với MongoDB.
import { requireAuth } from "../middleware/auth.js"; // Middleware kiểm tra người dùng đã đăng nhập hay chưa.
import { signToken } from "../utils/tokens.js"; // Hàm tạo JWT token sau khi xác thực thành công.

const router = Router(); // Khởi tạo router để định nghĩa các endpoint xác thực.

// Schema dùng chung để kiểm tra dữ liệu đăng ký và đăng nhập.
const authSchema = z.object({
  name: z.string().min(2).optional(), // Tên phải có ít nhất 2 ký tự nếu được cung cấp.
  email: z.string().trim().toLowerCase().email(), // Loại bỏ khoảng trắng, chuyển email thành chữ thường và kiểm tra định dạng.
  password: z.string().min(6) // Mật khẩu phải có ít nhất 6 ký tự.
});

// =====================================================
// API ĐĂNG KÝ TÀI KHOẢN
// Phương thức: POST /register
// =====================================================
router.post("/register", async (req, res, next) => {
  try {
    // Kiểm tra dữ liệu gửi lên.
    // Khi đăng ký, trường name là bắt buộc và phải có ít nhất 2 ký tự.
    const data = authSchema
      .extend({ name: z.string().min(2) })
      .parse(req.body);

    // Tìm tài khoản có email tương ứng trong cơ sở dữ liệu.
    const existing = await User.findOne({ email: data.email });

    // Nếu email đã tồn tại thì trả về HTTP 409 (Conflict).
    if (existing) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // Tạo tài khoản mới trong MongoDB.
    // Model User có thể tự mã hóa mật khẩu bằng middleware pre-save.
    const user = await User.create(data);

    // Tạo JWT token để người dùng sử dụng trong các request tiếp theo.
    const token = signToken(user);

    // Trả về token và thông tin cơ bản của tài khoản vừa tạo.
    // Không trả mật khẩu trong response.
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone
      }
    });
  } catch (error) {
    // Chuyển lỗi cho middleware xử lý lỗi tập trung.
    // Ví dụ: dữ liệu không hợp lệ hoặc lỗi kết nối MongoDB.
    next(error);
  }
});

// =====================================================
// API ĐĂNG NHẬP
// Phương thức: POST /login
// =====================================================
router.post("/login", async (req, res, next) => {
  try {
    // Đăng nhập không cần trường name, chỉ kiểm tra email và password.
    const data = authSchema
      .omit({ name: true })
      .parse(req.body);

    // Tìm tài khoản theo email.
    // select("+password") yêu cầu Mongoose lấy thêm trường password,
    // vì model User có thể cấu hình ẩn trường này mặc định.
    const user = await User.findOne({
      email: data.email
    }).select("+password");

    // Nếu không tìm thấy tài khoản hoặc mật khẩu không đúng,
    // trả về cùng một thông báo để hạn chế tiết lộ email có tồn tại hay không.
    if (!user || !(await user.comparePassword(data.password))) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Kiểm tra tài khoản có bị quản trị viên khóa hay không.
    if (user.isBlocked) {
      return res.status(403).json({
        message:
          "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
      });
    }

    // Thông tin đăng nhập hợp lệ và tài khoản không bị khóa:
    // tạo JWT token để xác thực những request tiếp theo.
    const token = signToken(user);

    // Trả về token và thông tin cơ bản của người dùng.
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone
      }
    });
  } catch (error) {
    // Chuyển lỗi cho middleware xử lý lỗi tập trung.
    next(error);
  }
});

// =====================================================
// API LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI
// Phương thức: GET /me
// =====================================================
router.get("/me", requireAuth, (req, res) => {
  // requireAuth chạy trước để xác thực JWT và gắn thông tin
  // người dùng đã xác thực vào req.user.
  // Nếu token không hợp lệ, middleware sẽ từ chối request.
  res.json({
    user: req.user
  });
});

// Xuất router để file khởi tạo Express có thể sử dụng.
export default router;
