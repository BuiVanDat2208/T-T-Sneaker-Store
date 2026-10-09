import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // vd: "ai_tools"
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // Lưu object { search_products: true, get_order_status: false }
  description: { type: String }
}, { timestamps: true });

export const Setting = mongoose.model("Setting", settingSchema);
