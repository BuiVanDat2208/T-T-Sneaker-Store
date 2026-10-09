import { Router } from "express";
import { z } from "zod";
import { chatWithAI } from "../utils/ai.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { message, history } = z.object({ 
      message: z.string().min(1),
      history: z.array(z.any()).optional()
    }).parse(req.body);

    const result = await chatWithAI(message, history || []);

    res.json(result);
  } catch (error) {
    // Fallback if AI fails (missing key or quota)
    if (error.message?.includes("API_KEY")) {
      return res.json({ reply: "Hệ thống AI đang bảo trì (Thiếu API Key). Bạn vui lòng quay lại sau nhé!" });
    }
    next(error);
  }
});

export default router;
