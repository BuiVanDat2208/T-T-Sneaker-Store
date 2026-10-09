import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { Setting } from "../models/Setting.js";

const router = Router();

// Lấy toàn bộ cài đặt (Công khai cho cả khách hàng xem phí ship, v.v.)
router.get("/", async (req, res, next) => {
  try {
    const settings = await Setting.find();
    // Chuyển mảng sang object key-value cho dễ dùng ở frontend
    const config = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json({ settings: config });
  } catch (error) {
    next(error);
  }
});

// Cập nhật hoặc tạo mới cài đặt (Chỉ Admin)
router.post("/batch", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    console.log("[Settings] Received body:", JSON.stringify(req.body, null, 2));
    const { settings } = req.body;
    console.log("[Settings] Updating batch:", settings ? Object.keys(settings) : "null");
    const promises = Object.entries(settings).map(([key, value]) => {
      return Setting.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    });

    await Promise.all(promises);
    console.log("[Settings] Update successful");
    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("[Settings] Update failed:", error);
    next(error);
  }
});

export default router;
