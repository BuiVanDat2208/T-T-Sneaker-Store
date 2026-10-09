import { Router } from "express";
import { Activity } from "../models/Activity.js";

const router = Router();

// Endpoint công khai để log hành vi (không bắt buộc login)
router.post("/log", async (req, res, next) => {
  try {
    const { type, path, metadata, sessionId, userId } = req.body;

    const activity = await Activity.create({
      userId: userId || null,
      sessionId,
      type,
      path,
      metadata,
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.status(201).json({ success: true });
  } catch (error) {
    // Không làm gián đoạn trải nghiệm người dùng nếu log lỗi
    console.error("Analytics Error:", error);
    res.status(500).json({ success: false });
  }
});

// Endpoint cho Admin xem thống kê hành vi (Dùng cho AI sau này)
router.get("/summary", async (req, res, next) => {
  try {
    const topProducts = await Activity.aggregate([
      { $match: { type: "page_view", "metadata.productId": { $exists: true } } },
      { $group: { _id: "$metadata.productId", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      }
    ]);

    res.json({ topProducts });
  } catch (error) {
    next(error);
  }
});

export default router;
