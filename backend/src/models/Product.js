import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Thông tin cơ bản
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, unique: true, sparse: true },
    description: { type: String, required: true },
    
    // Giá cả
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    
    // Phân loại
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    brandName: { type: String }, // Lưu tên thương hiệu để search nhanh
    
    // Đặc tính giày (Sneaker Specs)
    gender: { 
      type: String, 
      enum: ["men", "women", "unisex", "kids"], 
      default: "unisex" 
    },
    style: { 
      type: String, 
      enum: ["low", "mid", "high"], 
      default: "low" 
    },
    materials: [{ type: String }],
    colors: [{ type: String }],
    
    // Quản lý kho hàng (Variants)
    variants: [{
      size: { type: Number, required: true },
      stock: { type: Number, required: true, min: 0, default: 0 }
    }],
    totalStock: { type: Number, default: 0 },
    
    // Hình ảnh
    images: [{ type: String, required: true }],
    
    // Trạng thái & Marketing
    status: { 
      type: String, 
      enum: ["active", "draft", "archived"], 
      default: "active" 
    },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    tags: [{ type: String }],
    
    // AI Optimization
    aiSearchString: { type: String }
  },
  { timestamps: true }
);

// Tự động tính tổng stock trước khi lưu
productSchema.pre("save", function(next) {
  this.totalStock = this.variants.reduce((total, v) => total + v.stock, 0);
  
  // Tạo AI Search String
  const parts = [
    this.name,
    this.brandName,
    this.gender,
    this.style,
    (this.materials || []).join(" "),
    (this.colors || []).join(" "),
    (this.tags || []).join(" "),
    this.description
  ];
  this.aiSearchString = parts.filter(Boolean).join(" ").toLowerCase();
  
  next();
});

productSchema.index({ name: "text", description: "text", aiSearchString: "text" });

export const Product = mongoose.model("Product", productSchema);
