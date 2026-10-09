import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";

const router = Router();

router.get("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// Cập nhật thông tin người dùng / vai trò / trạng thái khóa (Chỉ Admin)
router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, email, role, isBlocked, address, phone } = req.body;
    
    // Không cho phép Admin tự khóa chính mình hoặc tự giáng chức chính mình
    if (req.user._id.toString() === req.params.id) {
      if (isBlocked !== undefined && isBlocked === true) {
        return res.status(400).json({ message: "Bạn không thể tự khóa tài khoản của chính mình." });
      }
      if (role !== undefined && role !== "admin") {
        return res.status(400).json({ message: "Bạn không thể tự đổi vai trò admin của chính mình." });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isBlocked, address, phone },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    res.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
});

// Xóa người dùng (Chỉ Admin)
router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // Không cho phép Admin tự xóa chính mình
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "Bạn không thể tự xóa tài khoản của chính mình." });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    res.json({ success: true, message: "Đã xóa người dùng thành công." });
  } catch (error) {
    next(error);
  }
});

export default router;
