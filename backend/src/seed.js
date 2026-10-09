import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import { Category } from "./models/Category.js";
import { Product } from "./models/Product.js";
import { User } from "./models/User.js";
import { Brand } from "./models/Brand.js";

dotenv.config();

const image = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

async function seed() {
  await connectDb();
  console.log("Clearing old data...");
  await Promise.all([
    User.deleteMany(), 
    Category.deleteMany(), 
    Product.deleteMany(),
    Brand.deleteMany()
  ]);

  console.log("Seeding Categories...");
  const [running, lifestyle, training] = await Category.insertMany([
    { name: "Running", slug: "running" },
    { name: "Lifestyle", slug: "lifestyle" },
    { name: "Training", slug: "training" }
  ]);

  console.log("Seeding Brands...");
  const [nike, adidas, nb, puma] = await Brand.insertMany([
    { name: "Nike", slug: "nike", description: "Just Do It" },
    { name: "Adidas", slug: "adidas", description: "Impossible is Nothing" },
    { name: "New Balance", slug: "new-balance", description: "Fearlessly Independent" },
    { name: "Puma", slug: "puma", description: "Forever Faster" }
  ]);

  console.log("Seeding Admin...");
  await User.create({
    name: "Admin T&T",
    email: "buivandat2003hn@gmail.com",
    password: "123456",
    role: "admin",
    phone: "0343289288",
    address: "Ha Noi City"
  });

  console.log("Seeding Products...");
  await Product.insertMany([
    {
      name: "Nike Air Zoom Pegasus 41",
      slug: "nike-air-zoom-pegasus-41",
      description: "Giày chạy bộ nhẹ, đệm phản hồi tốt cho luyện tập hằng ngày.",
      price: 3290000,
      originalPrice: 3890000,
      brandId: nike._id,
      brandName: "Nike",
      gender: "unisex",
      style: "low",
      variants: [
        { size: 40, stock: 10 },
        { size: 41, stock: 15 },
        { size: 42, stock: 17 }
      ],
      images: [image("1542291026-7eec264c27ff"), image("1608231387042-66d1773070a5")],
      categoryId: running._id,
      isFeatured: true,
      isBestSeller: true,
      status: "active"
    },
    {
      name: "Adidas Ultraboost Light",
      slug: "adidas-ultraboost-light",
      description: "Đế Boost êm, upper Primeknit thoáng khí, phù hợp đi bộ và chạy nhẹ.",
      price: 4190000,
      originalPrice: 4990000,
      brandId: adidas._id,
      brandName: "Adidas",
      gender: "unisex",
      style: "low",
      variants: [
        { size: 38, stock: 5 },
        { size: 39, stock: 10 },
        { size: 40, stock: 13 }
      ],
      images: [image("1605408499391-6368c628ef42"), image("1539185441755-769473a23570")],
      categoryId: running._id,
      isFeatured: true,
      status: "active"
    },
    {
      name: "New Balance 9060 Sea Salt",
      slug: "new-balance-9060-sea-salt",
      description: "Thiết kế lifestyle chunky, phối màu sáng dễ mặc, đệm ABZORB ổn định.",
      price: 3790000,
      originalPrice: 4290000,
      brandId: nb._id,
      brandName: "New Balance",
      gender: "unisex",
      style: "low",
      variants: [
        { size: 40, stock: 8 },
        { size: 41, stock: 10 }
      ],
      images: [image("1491553895911-0055eca6402d"), image("1525966222134-fcfa99b8ae77")],
      categoryId: lifestyle._id,
      isBestSeller: true,
      status: "active"
    },
    {
      name: "Puma Velocity Nitro 3",
      slug: "puma-velocity-nitro-3",
      description: "Mẫu training đa dụng, bám đường tốt, trọng lượng cân bằng.",
      price: 2690000,
      originalPrice: 3190000,
      brandId: puma._id,
      brandName: "Puma",
      gender: "unisex",
      style: "low",
      variants: [
        { size: 40, stock: 12 },
        { size: 41, stock: 13 }
      ],
      images: [image("1549298916-b41d501d3772"), image("1579338559194-a162d19bf842")],
      categoryId: training._id,
      status: "active"
    }
  ]);

  console.log("Seed completed. Admin: buivandat2003hn@gmail.com/123456");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
