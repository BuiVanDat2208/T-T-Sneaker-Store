import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    logo: { type: String, default: "" }
  },
  { timestamps: true }
);

export const Brand = mongoose.model("Brand", brandSchema);
