import { GoogleGenerativeAI } from "@google/generative-ai";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { Setting } from "../models/Setting.js";
import dotenv from "dotenv";

dotenv.config();

const genAI = GoogleGenerativeAI ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "") : null;

// 1. Định nghĩa các hàm thực thi (Tools)
const tools = {
  search_products: async (args) => {
    const { query, brand, minPrice, maxPrice } = args;
    const filter = {};
    if (query) filter.$or = [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } }
    ];
    if (brand) filter.brandName = { $regex: brand, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter).limit(3).select("name price slug images brandName");
    return products.map(p => ({
      type: "product",
      name: p.name,
      price: p.price.toLocaleString() + "đ",
      slug: p.slug,
      image: p.images?.[0] || ""
    }));
  },

  get_order_status: async (args) => {
    const { orderId } = args;
    const order = await Order.findOne({
      $or: [{ _id: orderId.length === 24 ? orderId : null }, { orderNumber: orderId }]
    });
    if (!order) return { error: "Không tìm thấy đơn hàng." };
    return {
      type: "order",
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.totalAmount.toLocaleString() + "đ"
    };
  }
};

// 2. Cấu hình Gemini Tools
const geminiTools = [
  {
    functionDeclarations: [
      {
        name: "search_products",
        description: "Tìm kiếm sản phẩm giày trong cửa hàng",
        parameters: {
          type: "OBJECT",
          properties: {
            query: { type: "STRING", description: "Từ khóa tìm kiếm (tên giày, màu sắc, mục đích)" },
            brand: { type: "STRING", description: "Thương hiệu (Nike, Adidas, Jordan...)" },
            minPrice: { type: "NUMBER" },
            maxPrice: { type: "NUMBER" }
          }
        }
      },
      {
        name: "get_order_status",
        description: "Tra cứu trạng thái đơn hàng của khách",
        parameters: {
          type: "OBJECT",
          properties: {
            orderId: { type: "STRING", description: "Mã đơn hàng hoặc ID đơn hàng" }
          },
          required: ["orderId"]
        }
      }
    ]
  }
];

export async function chatWithAI(message, history = []) {
  if (!genAI) return "Hệ thống AI chưa sẵn sàng (Thiếu thư viện).";
  if (!process.env.GEMINI_API_KEY) return "Thiếu GEMINI_API_KEY.";

  // Lấy cấu hình bật/tắt hành động từ Admin
  let aiSettings = { search_products: true, get_order_status: true };
  try {
    const dbSettings = await Setting.findOne({ key: "ai_tools" });
    if (dbSettings) aiSettings = dbSettings.value;
  } catch (err) {
    console.error("Failed to fetch AI settings:", err);
  }

  // Chỉ kích hoạt các công cụ được Admin cho phép
  const activeTools = geminiTools[0].functionDeclarations.filter(tool => aiSettings[tool.name]);

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    tools: activeTools.length > 0 ? [{ functionDeclarations: activeTools }] : [],
    systemInstruction: `Bạn là T&T AI Agent - Trợ lý mua sắm cao cấp.
    QUY TRÌNH XỬ LÝ:
    1. Phân tích nhu cầu khách hàng.
    2. Chỉ sử dụng các công cụ được cung cấp (hiện có: ${activeTools.map(t => t.name).join(", ")}).
    3. Nếu khách yêu cầu hành động mà công cụ tương ứng bị tắt (không có trong danh sách), hãy lịch sự từ chối và báo rằng tính năng đang bảo trì.
    4. Trả lời thân thiện bằng tiếng Việt, kèm emoji phù hợp.`
  }, { apiVersion: "v1beta" }); // Đảm bảo dùng API mới nhất cho 2.5

  // Làm sạch lịch sử cực kỳ cẩn thận cho Gemini 2.5
  const validHistory = history
    .filter(h => h && typeof h.content === "string" && h.content.trim() !== "")
    .map(h => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content.trim() }]
    }))
    .filter((item, index) => {
      // Gemini 2.5 bắt buộc phải bắt đầu bằng 'user'
      if (index === 0 && item.role === "model") return false;
      return true;
    });

  const chat = model.startChat({
    history: validHistory
  });

  // Gửi tin nhắn và xử lý logic
  let result = await chat.sendMessage(message);
  let response = result.response;
  let call = response.candidates[0].content.parts.find(p => p.functionCall);

  let actions = [];
  if (call) {
    const { name, args } = call.functionCall;

    // Kiểm tra bảo mật một lần nữa ở phía thực thi
    if (aiSettings[name]) {
      const toolResult = await tools[name](args);

      result = await chat.sendMessage([{
        functionResponse: {
          name,
          response: { content: toolResult }
        }
      }]);

      response = result.response;
      if (Array.isArray(toolResult)) {
        actions = toolResult;
      }
    } else {
      // Nếu AI gọi nhầm công cụ đã bị tắt
      result = await chat.sendMessage("Thông báo cho khách rằng tính năng này đang tạm khóa.");
      response = result.response;
    }
  }

  return {
    reply: response.text(),
    actions: actions
  };
}
