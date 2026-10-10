
import { Router } from "express"; // Import Router để xây dựng các API quản lý danh mục.
import { z } from "zod"; // Import Zod để kiểm tra dữ liệu đầu vào.
import { requireAdmin, requireAuth } from "../middleware/auth.js";
// requireAuth: xác minh người dùng đã đăng nhập.
// requireAdmin: kiểm tra người dùng có quyền quản trị viên.

import { Category } from "../models/Category.js"; // Model Category thao tác với dữ liệu danh mục trong MongoDB.
import { Product } from "../models/Product.js"; // Model Product dùng để truy vấn sản phẩm theo danh mục.

const router = Router(); // Khởi tạo router cho các API danh mục.

// Khai báo cấu trúc dữ liệu hợp lệ khi tạo hoặc cập nhật danh mục.
const schema = z.object({
  name: z.string().min(2), // Tên danh mục phải có ít nhất 2 ký tự.
  slug: z.string().min(2), // Slug phải có ít nhất 2 ký tự, thường dùng trong URL.
  description: z.string().optional() // Mô tả danh mục không bắt buộc.
});

// =====================================================
// API 1: LẤY DANH SÁCH DANH MỤC
// Phương thức: GET /
// Quyền truy cập: Công khai
// =====================================================
router.get("/", async (req, res, next) => {
  try {
    // Lấy tất cả danh mục từ MongoDB.
    // Sắp xếp theo tên danh mục tăng dần.
    const categories = await Category.find().sort({ name: 1 });

    // Trả danh sách danh mục về frontend dưới dạng JSON.
    res.json({ categories });
  } catch (error) {
    // Chuyển lỗi sang middleware xử lý lỗi tập trung.
    next(error);
  }
});

// =====================================================
// API 2: THÊM DANH MỤC MỚI
// Phương thức: POST /
// Quyền truy cập: Chỉ Admin đã đăng nhập
// =====================================================
router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // Kiểm tra dữ liệu gửi từ frontend bằng Zod.
    const data = schema.parse(req.body);

    // Tạo và lưu danh mục mới trong MongoDB.
    const category = await Category.create(data);

    // Trả về danh mục vừa tạo với mã HTTP 201 Created.
    res.status(201).json({ category });
  } catch (error) {
    // Chuyển lỗi xác thực hoặc lỗi cơ sở dữ liệu cho middleware xử lý.
    next(error);
  }
});

// =====================================================
// API 3: CẬP NHẬT DANH MỤC
// Phương thức: PUT /:id
// Quyền truy cập: Chỉ Admin đã đăng nhập
// =====================================================
router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // Tìm danh mục theo ID, kiểm tra dữ liệu đầu vào,
    // cập nhật và trả về bản ghi sau khi cập nhật.
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      schema.parse(req.body),
      {
        new: true // Yêu cầu trả về dữ liệu mới sau cập nhật.
      }
    );

    // Nếu không tìm thấy ID, category có thể là null.
    // Có thể bổ sung kiểm tra để trả về HTTP 404.
    res.json({ category });
  } catch (error) {
    // Chuyển lỗi cho middleware xử lý lỗi tập trung.
    next(error);
  }
});

// =====================================================
// API 4: XÓA DANH MỤC
// Phương thức: DELETE /:id
// Quyền truy cập: Chỉ Admin đã đăng nhập
// =====================================================
router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // Tìm và xóa danh mục theo ID trong MongoDB.
    await Category.findByIdAndDelete(req.params.id);

    // Trả HTTP 204 No Content, không có nội dung phản hồi.
    res.status(204).end();
  } catch (error) {
    // Chuyển lỗi cho middleware xử lý lỗi chung.
    next(error);
  }
});

// =====================================================
// API 5: LẤY SẢN PHẨM THEO DANH MỤC
// Phương thức: GET /:id/products
// Quyền truy cập: Công khai
// =====================================================
router.get("/:id/products", async (req, res, next) => {
  try {
    // Tìm các sản phẩm có categoryId trùng với ID danh mục
    // được truyền trong URL.
    // Sắp xếp sản phẩm mới tạo lên trước.
    const products = await Product.find({
      categoryId: req.params.id
    }).sort({ createdAt: -1 });

    // Trả danh sách sản phẩm thuộc danh mục đó.
    res.json({ products });
  } catch (error) {
    // Chuyển lỗi cho middleware xử lý lỗi tập trung.
    next(error);
  }
});

// Xuất router để ứng dụng Express có thể sử dụng.
export default router;
