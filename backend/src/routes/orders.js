import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Setting } from "../models/Setting.js";
import crypto from "crypto";

const router = Router();

const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      image: z.string(),
      quantity: z.number().int().min(1),
      size: z.number(),
      price: z.number().nonnegative()
    })
  ),
  shippingAddress: z.string().min(8),
  phone: z.string().min(10),
  shippingMethod: z.string().optional(),
  shippingFee: z.number().nonnegative().optional(),
  paymentMethod: z.enum(["cod", "stripe", "vnpay", "sepay"]),
  note: z.string().optional()
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== "admin") {
      query = { userId: req.user._id };
    }
    
    let ordersQuery = Order.find(query).sort({ createdAt: -1 });
    
    // Nếu là admin, lấy thêm thông tin người đặt
    if (req.user.role === "admin") {
      ordersQuery = ordersQuery.populate("userId", "name email");
    }
    
    const orders = await ordersQuery;
    res.json({ orders });
  } catch (error) {
    console.error("[Order Route] Error creating order:", error);
    next(error);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (req.user.role !== "admin" && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json({ order });
  } catch (error) {
    console.error("[Order Route] Error creating order:", error);
    next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    console.log("[Order Route] Incoming body:", req.body);
    const data = orderSchema.parse(req.body);
    
    // 1. Kiểm tra và trừ kho
    for (const item of data.items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.name} not found` });

      const variant = product.variants.find(v => v.size === item.size);
      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({ message: `Sản phẩm ${item.name} (Size ${item.size}) không đủ hàng trong kho.` });
      }

      // Trừ kho
      variant.stock -= item.quantity;
      await product.save(); // totalStock sẽ tự động cập nhật nhờ middleware pre-save
    }

    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const totalAmount = subtotal + (data.shippingFee || 0);

    // Generate orderCode if paymentMethod is "sepay" (VietQR)
    let orderCode = null;
    if (data.paymentMethod === "sepay") {
      const randomPart = Math.floor(1000 + Math.random() * 9000); // 4 digits
      const timePart = Number(String(Date.now()).slice(-5));      // 5 digits
      orderCode = Number(`${randomPart}${timePart}`);
    }

    const order = await Order.create({
      ...data,
      totalAmount,
      userId: req.user._id,
      orderCode
    });

    let checkoutUrl = null;

    if (data.paymentMethod === "sepay" && orderCode) {
      // Fetch PayOS configuration keys from Setting collection
      const payosClientIdSetting = await Setting.findOne({ key: "payos_client_id" });
      const payosApiKeySetting = await Setting.findOne({ key: "payos_api_key" });
      const payosChecksumKeySetting = await Setting.findOne({ key: "payos_checksum_key" });

      const clientId = payosClientIdSetting?.value;
      const apiKey = payosApiKeySetting?.value;
      const checksumKey = payosChecksumKeySetting?.value;

      if (clientId && apiKey && checksumKey) {
        try {
          let originUrl = process.env.CLIENT_URL || req.get("origin") || "";
          if (!originUrl && req.get("host")) {
            const host = req.get("host");
            originUrl = host.startsWith("http") ? host : `http://${host}`;
          }
          if (!originUrl) {
            originUrl = "http://localhost:3000";
          }

          const cancelUrl = `${originUrl}/orders/${order._id}?cancelled=true`;
          const returnUrl = `${originUrl}/orders/${order._id}?success=true`;
          const description = `Thanh toan DH ${orderCode}`; 

          const signatureData = `amount=${totalAmount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
          const signature = crypto
            .createHmac("sha256", checksumKey)
            .update(signatureData)
            .digest("hex");

          const response = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
            method: "POST",
            headers: {
              "x-client-id": clientId,
              "x-api-key": apiKey,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              orderCode,
              amount: totalAmount,
              description,
              cancelUrl,
              returnUrl,
              signature
            })
          });

          if (response.ok) {
            const payosRes = await response.json();
            if (payosRes.code === "00" && payosRes.data) {
              checkoutUrl = payosRes.data.checkoutUrl;
              order.paymentDetails = {
                source: "payos",
                orderCode,
                paymentLinkId: payosRes.data.paymentLinkId,
                checkoutUrl
              };
              await order.save();
            } else {
              console.error("[PayOS] API Error details:", payosRes);
            }
          } else {
            const errBody = await response.text();
            console.error("[PayOS] HTTP Error details:", errBody);
          }
        } catch (err) {
          console.error("[PayOS] Exception during payment link creation:", err);
        }
      }
    }

    // Cập nhật thông tin người dùng cho lần sau (Lấy địa chỉ và sđt mới nhất)
    User.findByIdAndUpdate(req.user._id, {
      address: data.shippingAddress,
      phone: data.phone
    }).exec().catch(err => console.error("Failed to update user profile:", err));

    res.status(201).json({ order, checkoutUrl });
  } catch (error) {
    console.error("[Order Route] Error creating order:", error);
    next(error);
  }
});

router.patch("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const { status } = z
      .object({
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"])
      })
      .parse(req.body);

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const oldStatus = order.status;

    // Phân quyền và luồng trạng thái
    if (req.user.role !== "admin") {
      if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }
      if (status !== "cancelled") {
        return res.status(400).json({ message: "Users can only cancel orders" });
      }
      if (!["pending", "processing"].includes(oldStatus)) {
        return res.status(400).json({ message: "Cannot cancel order in current status" });
      }
    }

    // Xử lý HOÀN KHO nếu đơn bị HỦY (và đơn đó chưa bị hủy trước đây)
    if (status === "cancelled" && oldStatus !== "cancelled") {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const variant = product.variants.find(v => v.size === item.size);
          if (variant) {
            variant.stock += item.quantity;
            await product.save();
          }
        }
      }
    }

    order.status = status;
    await order.save();
    
    res.json({ order });
  } catch (error) {
    console.error("[Order Route] Error creating order:", error);
    next(error);
  }
});

export default router;
