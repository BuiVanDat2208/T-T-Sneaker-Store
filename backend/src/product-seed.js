import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "./models/Product.js";
import { Category } from "./models/Category.js";
import { Brand } from "./models/Brand.js";

dotenv.config();

const products = [
  {
    name: "Air Jordan 1 Retro High OG 'Chicago Lost & Found'",
    description: "Phiên bản tái hiện lại đôi giày huyền thoại từ năm 1985. Với chất liệu da cao cấp được xử lý tạo hiệu ứng nứt nẻ vintage, đôi giày mang lại vẻ ngoài trường tồn với thời gian. Đế giày được thiết kế hỗ trợ tối đa cho việc vận động và di chuyển hàng ngày.",
    price: 12500000,
    originalPrice: 15000000,
    brandName: "Jordan",
    categoryName: "Giày Bóng Rổ",
    gender: "unisex",
    style: "high",
    materials: ["Leather", "Rubber"],
    colors: ["Red", "White", "Black"],
    variants: [
      { size: 40, stock: 5 },
      { size: 41, stock: 8 },
      { size: 42, stock: 12 },
      { size: 43, stock: 7 },
      { size: 44, stock: 3 }
    ],
    images: ["https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800"],
    isFeatured: true,
    tags: ["jordan", "retro", "chicago", "limited"]
  },
  {
    name: "Adidas Ultraboost Light",
    description: "Đôi giày chạy bộ nhẹ nhất từ trước đến nay của Adidas. Sử dụng công nghệ Boost Light thế hệ mới, giúp hoàn trả năng lượng tối ưu trong mỗi bước chạy. Thân giày Primeknit co giãn, ôm sát bàn chân như một chiếc tất.",
    price: 4500000,
    originalPrice: 5200000,
    brandName: "Adidas",
    categoryName: "Giày Chạy Bộ",
    gender: "men",
    style: "low",
    materials: ["Primeknit", "Boost"],
    colors: ["Core Black", "Cloud White"],
    variants: [
      { size: 39, stock: 10 },
      { size: 40, stock: 15 },
      { size: 41, stock: 20 },
      { size: 42, stock: 15 }
    ],
    images: ["https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=800"],
    isBestSeller: true,
    tags: ["adidas", "ultraboost", "running", "comfort"]
  },
  {
    name: "Nike Air Force 1 '07 White",
    description: "Đôi giày quốc dân không thể thiếu trong tủ đồ của bất kỳ ai. Thiết kế tối giản với tông màu trắng tinh khôi, dễ dàng phối hợp với mọi trang phục. Chất liệu da bền bỉ và đế Air êm ái.",
    price: 2900000,
    brandName: "Nike",
    categoryName: "Giày Lifestyle",
    gender: "unisex",
    style: "low",
    materials: ["Leather", "Synthetics"],
    colors: ["White"],
    variants: [
      { size: 36, stock: 20 },
      { size: 37, stock: 20 },
      { size: 38, stock: 25 },
      { size: 39, stock: 30 },
      { size: 40, stock: 30 },
      { size: 41, stock: 25 },
      { size: 42, stock: 20 }
    ],
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"],
    tags: ["nike", "af1", "white", "classic"]
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Xóa sản phẩm cũ để tránh trùng lặp khi chạy lại
    await Product.deleteMany({});
    console.log("Cleared old products");

    for (const p of products) {
      const category = await Category.findOne({ name: p.categoryName });
      const brand = await Brand.findOne({ name: p.brandName });

      if (category && brand) {
        const slug = p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
        await Product.create({
          ...p,
          slug,
          categoryId: category._id,
          brandId: brand._id
        });
        console.log(`Seeded: ${p.name}`);
      } else {
        console.warn(`Skipping ${p.name}: Category or Brand not found.`);
      }
    }

    console.log("Seed completed!");
    process.exit();
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seedProducts();
