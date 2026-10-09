import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";

const router = Router();

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  sku: z.string().optional(),
  description: z.string().min(10),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative().optional(),
  categoryId: z.string(),
  brandId: z.string(),
  brandName: z.string().optional(),
  gender: z.enum(["men", "women", "unisex", "kids"]).optional(),
  style: z.enum(["low", "mid", "high"]).optional(),
  materials: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  variants: z.array(z.object({
    size: z.number(),
    stock: z.number().nonnegative()
  })),
  images: z.array(z.string().url()).min(1),
  status: z.enum(["active", "draft", "archived"]).optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

router.get("/", async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 12), 48);
    const query = {};

    if (req.query.brandId) query.brandId = req.query.brandId;
    if (req.query.categoryId) query.categoryId = req.query.categoryId;
    if (req.query.gender) query.gender = req.query.gender;
    if (req.query.style) query.style = req.query.style;
    if (req.query.featured === "true") query.isFeatured = true;
    if (req.query.bestSeller === "true") query.isBestSeller = true;
    if (req.query.size) {
      query["variants.size"] = Number(req.query.size);
      query["variants.stock"] = { $gt: 0 };
    }
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }
    if (req.query.q) {
      query.$or = [
        { name: { $regex: req.query.q, $options: "i" } },
        { brandName: { $regex: req.query.q, $options: "i" } },
        { aiSearchString: { $regex: req.query.q, $options: "i" } }
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("categoryId")
        .populate("brandId")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/suggest", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    const products = q
      ? await Product.find({ $text: { $search: q } }).select("name slug brand images price").limit(6)
      : [];

    res.json({ products });
  } catch (error) {
    next(error);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate("categoryId");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = await Review.find({ productId: product._id })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json({ product, reviews });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.create(productSchema.parse(req.body));
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, productSchema.parse(req.body), {
      new: true
    });
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
