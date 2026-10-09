import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import path from "path";
import fs from "fs";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", requireAuth, requireAdmin, upload.single("image"), async (req, res, next) => {
  try {
    console.log("Upload request received", { file: req.file?.originalname, size: req.file?.size });
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Nếu có Cloudinary thì ưu tiên dùng
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      console.log("Using Cloudinary for upload");
      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "tt-sneaker-store",
        format: "jpg"
      });

      return res.json({ url: result.secure_url });
    } 
    
    // Nếu không có Cloudinary, fallback về Local Storage
    console.log("Cloudinary not configured, falling back to local storage");
    
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      console.log("Creating uploads directory:", uploadDir);
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname) || ".jpg"}`;
    const filePath = path.join(uploadDir, fileName);
    
    console.log("Saving file to:", filePath);
    fs.writeFileSync(filePath, req.file.buffer);
    
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
    const fileUrl = `${baseUrl}/uploads/${fileName}`;
    console.log("File saved successfully, URL:", fileUrl);
    
    res.json({ url: fileUrl });
    
  } catch (error) {
    console.error("Upload route error:", error);
    next(error);
  }
});

export default router;
