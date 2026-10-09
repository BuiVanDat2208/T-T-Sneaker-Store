import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { Brand } from "../models/Brand.js";
import { Product } from "../models/Product.js";

const router = Router();
const schema = z.object({ 
  name: z.string().min(2), 
  slug: z.string().min(2),
  description: z.string().optional(),
  logo: z.string().url().optional().or(z.literal(""))
});

router.get("/", async (req, res, next) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json({ brands });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const brand = await Brand.create(schema.parse(req.body));
    res.status(201).json({ brand });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, schema.parse(req.body), {
      new: true
    });
    res.json({ brand });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get("/:id/products", async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    
    // In our current product model, 'brand' is a string. 
    // We should probably match by name for now, or update product model to use brandId.
    const products = await Product.find({ brand: brand.name }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

export default router;
