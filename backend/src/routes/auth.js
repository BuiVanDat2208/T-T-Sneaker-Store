import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { signToken } from "../utils/tokens.js";

const router = Router();

const authSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6)
});

router.post("/register", async (req, res, next) => {
  try {
    const data = authSchema.extend({ name: z.string().min(2) }).parse(req.body);
    const existing = await User.findOne({ email: data.email });

    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create(data);
    const token = signToken(user);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, address: user.address, phone: user.phone }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = authSchema.omit({ name: true }).parse(req.body);
    const user = await User.findOne({ email: data.email }).select("+password");

    if (!user || !(await user.comparePassword(data.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên." });
    }

    const token = signToken(user);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, address: user.address, phone: user.phone }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
