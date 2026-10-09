import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { Category } from "../models/Category.js";

const router = Router();
const schema = z.object({ 
  name: z.string().min(2), 
  slug: z.string().min(2),
  description: z.string().optional()
});

router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const category = await Category.create(schema.parse(req.body));
    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, schema.parse(req.body), {
      new: true
    });
    res.json({ category });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
import { Product } from "../models/Product.js";

router.get("/:id/products", async (req, res, next) => {
  try {
    const products = await Product.find({ categoryId: req.params.id }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

export default router;
