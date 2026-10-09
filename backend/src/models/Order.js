import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: Number, required: true },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    shippingAddress: { type: String, required: true },
    phone: { type: String, required: false },
    shippingMethod: { type: String, default: "standard" },
    shippingFee: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ["cod", "stripe", "vnpay", "sepay"], required: true },
    paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
    paymentDetails: { type: mongoose.Schema.Types.Mixed },
    orderCode: { type: Number, unique: true, sparse: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
