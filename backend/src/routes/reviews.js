import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { Review } from "../models/Review.js";

const router = Router();

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = z
      .object({
        productId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().min(3)
      })
      .parse(req.body);

    const review = await Review.findOneAndUpdate(
      { productId: data.productId, userId: req.user._id },
      { ...data, userId: req.user._id },
      { upsert: true, new: true }
    );

    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
});

export default router;
