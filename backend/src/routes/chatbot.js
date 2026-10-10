
import { Router } from "express"; // Import Router để xây dựng API chatbot.
import { z } from "zod"; // Import Zod để kiểm tra dữ liệu đầu vào.
import { chatWithAI } from "../utils/ai.js";
// Import hàm xử lý hội thoại với AI.
// Hàm này đảm nhiệm việc gửi câu hỏi đến dịch vụ AI và nhận kết quả trả lời.

const router = Router(); // Khởi tạo router dành cho chức năng chatbot.

// =====================================================
// API CHATBOT AI
// Phương thức: POST /
// Chức năng: Nhận câu hỏi và trả về phản hồi từ AI.
// =====================================================
router.post("/", async (req, res, next) => {
  try {
    // Kiểm tra dữ liệu gửi từ frontend bằng Zod.
    // message: câu hỏi hiện tại, bắt buộc và không được là chuỗi rỗng.
    // history: lịch sử hội thoại, là một mảng và không bắt buộc.
    const { message, history } = z.object({
      message: z.string().min(1),
      history: z.array(z.any()).optional()
    }).parse(req.body);

    // Gọi hàm AI để xử lý câu hỏi.
    // Nếu không gửi history, sử dụng mảng rỗng.
    const result = await chatWithAI(message, history || []);

    // Trả kết quả AI về frontend dưới dạng JSON.
    res.json(result);
  } catch (error) {
    // Xử lý một trường hợp dự phòng:
    // nếu lỗi có thông báo chứa API_KEY thì trả thông báo
    // cho người dùng biết dịch vụ AI đang thiếu khóa API.
    // Đây là kiểm tra chuỗi thông báo lỗi, không phải xử lý mọi loại lỗi AI.
    if (error.message?.includes("API_KEY")) {
      return res.json({
        reply: "Hệ thống AI đang bảo trì (Thiếu API Key). Bạn vui lòng quay lại sau nhé!"
      });
    }

    // Với các lỗi khác, chuyển sang middleware xử lý lỗi tập trung.
    // Ví dụ: lỗi kết nối dịch vụ AI hoặc lỗi phát sinh trong xử lý.
    next(error);
  }
});

// Xuất router để ứng dụng Express sử dụng.
export default router;
