
import { Router } from "express"; // Import Router để xây dựng các API quản lý thương hiệu.
import { z } from "zod"; // Import Zod để kiểm tra dữ liệu đầu vào.
import { requireAdmin, requireAuth } from "../middleware/auth.js";
// requireAuth: xác minh người dùng đã đăng nhập.
// requireAdmin: kiểm tra người dùng có quyền quản trị viên hay không.

import { Brand } from "../models/Brand.js"; // Model Brand dùng để thao tác với bộ sưu tập thương hiệu trong MongoDB.
import { Product } from "../models/Product.js"; // Model Product dùng để truy vấn sản phẩm.

const router = Router(); // Khởi tạo router cho các API thương hiệu.

// Schema quy định cấu trúc dữ liệu hợp lệ khi tạo hoặc cập nhật thương hiệu.
const schema = z.object({
  name: z.string().min(2), // Tên thương hiệu phải có ít nhất 2 ký tự.
  slug: z.string().min(2), // Slug phải có ít nhất 2 ký tự, thường dùng trong URL.
  description: z.string().optional(), // Mô tả thương hiệu là trường không bắt buộc.
  logo: z.string().url().optional().or(z.literal(""))
  // Logo có thể là URL hợp lệ, không được cung cấp hoặc là chuỗi rỗng.
});

// =====================================================
// API 1: LẤY DANH SÁCH THƯƠNG HIỆU
// Phương thức: GET /
// Quyền truy cập: Công khai
// =====================================================
router.get("/", async (req, res, next) => {
  try {
    // Lấy tất cả thương hiệu từ MongoDB.
    // sort({ name: 1 }) sắp xếp tên theo thứ tự tăng dần.
    const brands = await Brand.find().sort({ name: 1 });

    // Trả danh sách thương hiệu dưới dạng JSON.
    res.json({ brands });
  } catch (error) {
    // Chuyển lỗi sang middleware xử lý lỗi tập trung.
    next(error);
  }
});

// =====================================================
// API 2: THÊM THƯƠNG HIỆU MỚI
// Phương thức: POST /
// Quyền truy cập: Chỉ quản trị viên đã đăng nhập
// =====================================================
router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // Kiểm tra dữ liệu gửi lên theo schema trước khi lưu.
    const data = schema.parse(req.body);

    // Tạo thương hiệu mới trong MongoDB.
    const brand = await Brand.create(data);

    // Trả về thương hiệu vừa tạo với mã HTTP 201 Created.
    res.status(201).json({ brand });
  } catch (error) {
    // Chuyển lỗi xác thực dữ liệu hoặc lỗi cơ sở dữ liệu
    // sang middleware xử lý lỗi chung.
    next(error);
  }
});

// =====================================================
// API 3: CẬP NHẬT THƯƠNG HIỆU
// Phương thức: PUT /:id
// Quyền truy cập: Chỉ quản trị viên đã đăng nhập
// =====================================================
router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // Tìm thương hiệu theo MongoDB ObjectId trong URL,
    // kiểm tra dữ liệu cập nhật và trả về bản ghi sau cập nhật.
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      schema.parse(req.body),
      {
        new: true // Trả về dữ liệu mới sau khi cập nhật.
      }
    );

    // Trả về thương hiệu đã cập nhật.
    // Lưu ý: nếu không tìm thấy ID, brand có thể là null.
    res.json({ brand });
  } catch (error) {
    // Chuyển lỗi cho middleware xử lý lỗi tập trung.
    next(error);
  }
});

// =====================================================
// API 4: XÓA THƯƠNG HIỆU
// Phương thức: DELETE /:id
// Quyền truy cập: Chỉ quản trị viên đã đăng nhập
// =====================================================
router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // Tìm và xóa thương hiệu theo ID.
    await Brand.findByIdAndDelete(req.params.id);

    // Trả về HTTP 204 No Content: thao tác được xử lý
    // và không cần gửi nội dung phản hồi.
    res.status(204).end();
  } catch (error) {
    // Chuyển lỗi cho middleware xử lý lỗi chung.
    next(error);
  }
});

// =====================================================
// API 5: LẤY SẢN PHẨM THEO THƯƠNG HIỆU
// Phương thức: GET /:id/products
// Quyền truy cập: Công khai
// =====================================================
router.get("/:id/products", async (req, res, next) => {
  try {
    // Tìm thương hiệu theo ID truyền trong URL.
    const brand = await Brand.findById(req.params.id);

    // Nếu thương hiệu không tồn tại, trả về HTTP 404.
    if (!brand) {
      return res.status(404).json({
        message: "Brand not found"
      });
    }

    // Truy vấn các sản phẩm có trường brand trùng với tên thương hiệu.
    // Sắp xếp sản phẩm mới tạo lên trước.
    // Lưu ý: cách truy vấn này chỉ đúng nếu Product thực sự có trường
    // brand dạng chuỗi chứa tên thương hiệu.
    const products = await Product.find({
      brand: brand.name
    }).sort({ createdAt: -1 });

    // Trả danh sách sản phẩm của thương hiệu.
    res.json({ products });
  } catch (error) {
    // Chuyển lỗi cho middleware xử lý lỗi tập trung.
    next(error);
  }
});

// Xuất router để file khởi tạo Express gắn vào ứng dụng backend.
export default router;
