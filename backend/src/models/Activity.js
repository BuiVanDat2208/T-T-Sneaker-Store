import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    sessionId: { type: String, required: true, index: true },
    type: { 
      type: String, 
      enum: ["page_view", "click", "search", "add_to_cart", "checkout", "purchase"], 
      required: true 
    },
    path: { type: String }, // Đường dẫn trang (vd: /products/nike-air-max)
    metadata: {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      query: { type: String }, // Từ khóa tìm kiếm
      source: { type: String }, // Nguồn truy cập (vd: facebook, google)
      device: { type: String },
      duration: { type: Number }, // Thời gian ở lại trang (ms)
    },
    ip: { type: String },
    userAgent: { type: String }
  },
  { timestamps: true }
);

// Index để AI query nhanh hơn theo thời gian và người dùng
activitySchema.index({ createdAt: -1 });
activitySchema.index({ userId: 1, type: 1 });

export const Activity = mongoose.model("Activity", activitySchema);
