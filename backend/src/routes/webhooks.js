import express from "express";
import { Order } from "../models/Order.js";
import { Setting } from "../models/Setting.js";
import crypto from "crypto";

const router = express.Router();

/**
 * Webhook nhận thông báo thanh toán từ SePay
 * Endpoint: POST /api/webhooks/sepay
 */
router.post("/sepay", async (req, res) => {
  try {
    const data = req.body;
    console.log("[SePay Webhook] Start processing. Data:", JSON.stringify(data));

    // 1. Xác thực Webhook Token
    const sepayTokenSetting = await Setting.findOne({ key: "sepay_webhook_token" });
    const webhookToken = sepayTokenSetting?.value;
    console.log("[SePay Webhook] Webhook Token in DB:", webhookToken ? "FOUND" : "NOT FOUND");
    
    const authHeader = req.headers["authorization"] || "";
    const incomingToken = authHeader.replace(/^(Bearer|Apikey)\s+/i, "");
    console.log("[SePay Webhook] Incoming Token:", incomingToken);
    
    if (webhookToken && incomingToken !== webhookToken) {
      console.warn("[SePay Webhook] Unauthorized access attempt.");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 2. Phân tích nội dung chuyển khoản (Content) để tìm mã đơn hàng
    const content = data.content || "";
    console.log("[SePay Webhook] Transfer Content:", content);

    // Tìm mã đơn hàng có định dạng DH + 24 ký tự hex hoặc DH + 6 ký tự cuối
    const orderMatch = content.match(/DH([a-fA-F0-9]{6,24})/i);
    
    if (!orderMatch) {
      console.warn("[SePay Webhook] Could not find order ID in content:", content);
      return res.status(200).json({ success: true, message: "No order ID found" });
    }

    const orderIdPart = orderMatch[1];
    console.log("[SePay Webhook] Extracted Order ID Part:", orderIdPart);
    let order;

    // Tìm đơn hàng theo ID đầy đủ hoặc 6 ký tự cuối
    if (orderIdPart.length === 24) {
      console.log("[SePay Webhook] Searching by full ID...");
      order = await Order.findById(orderIdPart);
    } else {
      console.log("[SePay Webhook] Searching by last 6 chars...");
      // Tìm đơn hàng có ID kết thúc bằng orderIdPart
      const allOrders = await Order.find({ status: "pending", paymentMethod: "sepay" });
      console.log(`[SePay Webhook] Found ${allOrders.length} pending SePay orders to check.`);
      order = allOrders.find(o => o._id.toString().toLowerCase().endsWith(orderIdPart.toLowerCase()));
    }

    if (!order) {
      console.warn("[SePay Webhook] Order not found in database:", orderIdPart);
      return res.status(200).json({ success: true, message: "Order not found" });
    }

    console.log("[SePay Webhook] Found Order:", order._id, "Total Amount:", order.totalAmount);

    // 3. Kiểm tra số tiền
    const amount = parseFloat(data.transferAmount);
    console.log("[SePay Webhook] Transfer Amount:", amount);

    if (amount < order.totalAmount) {
      console.warn(`[SePay Webhook] Insufficient amount. Expected ${order.totalAmount}, got ${amount}`);
      return res.status(200).json({ success: true, message: "Insufficient amount" });
    }

    // 4. Cập nhật trạng thái đơn hàng
    console.log("[SePay Webhook] Updating order status...");
    order.paymentStatus = "paid";
    order.status = "processing";
    order.paymentDetails = {
      source: "sepay",
      sepayId: data.id,
      transactionDate: data.transactionDate,
      accountNumber: data.accountNumber,
      referenceCode: data.referenceCode,
      content: data.content
    };

    await order.save();
    console.log(`[SePay Webhook] Order ${order._id} marked as PAID successfully.`);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("[SePay Webhook] CRITICAL ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});

/**
 * Webhook nhận thông báo thanh toán từ PayOS
 * Endpoint: POST /api/webhooks/payos
 */
router.post("/payos", async (req, res) => {
  try {
    const { data, signature } = req.body;
    console.log("[PayOS Webhook] Received webhook notification. Data:", JSON.stringify(data));

    if (!data || !signature) {
      console.warn("[PayOS Webhook] Missing data or signature.");
      return res.status(400).json({ success: false, message: "Missing data or signature" });
    }

    // 1. Lấy Checksum Key từ DB
    const payosChecksumKeySetting = await Setting.findOne({ key: "payos_checksum_key" });
    const checksumKey = payosChecksumKeySetting?.value;

    if (!checksumKey) {
      console.error("[PayOS Webhook] payos_checksum_key not found in settings.");
      return res.status(500).json({ success: false, message: "Server not configured for PayOS" });
    }

    // 2. Xác thực chữ ký (loại trừ trường signature trong data trước khi hash)
    const sortedKeys = Object.keys(data)
      .filter(key => key !== "signature")
      .sort();
    const dataString = sortedKeys
      .map(key => {
        let val = data[key];
        if (val === null || val === undefined) {
          val = "";
        }
        return `${key}=${val}`;
      })
      .join("&");

    const expectedSignature = crypto
      .createHmac("sha256", checksumKey)
      .update(dataString)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("[PayOS Webhook] Invalid signature. Expected:", expectedSignature, "Got:", signature);
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    console.log("[PayOS Webhook] Signature verified successfully!");

    // 3. Tìm đơn hàng theo orderCode
    const orderCode = Number(data.orderCode);
    const order = await Order.findOne({ orderCode });

    if (!order) {
      console.warn("[PayOS Webhook] Order not found for orderCode:", orderCode);
      return res.status(200).json({ success: true, message: "Order not found" }); // Trả về 200 cho PayOS
    }

    if (order.paymentStatus === "paid") {
      console.log("[PayOS Webhook] Order already marked as PAID.");
      return res.status(200).json({ success: true, message: "Already paid" });
    }

    // 4. Đối soát số tiền
    const amount = Number(data.amount);
    if (amount < order.totalAmount) {
      console.warn(`[PayOS Webhook] Underpaid amount. Expected ${order.totalAmount}, got ${amount}`);
      return res.status(200).json({ success: true, message: "Underpaid amount" });
    }

    // 5. Cập nhật trạng thái đơn hàng
    console.log("[PayOS Webhook] Updating order payment status to PAID...");
    order.paymentStatus = "paid";
    order.status = "processing";
    order.paymentDetails = {
      source: "payos",
      orderCode,
      paymentLinkId: data.paymentLinkId,
      referenceCode: data.reference,
      transactionDate: data.transactionDateTime,
      amount
    };

    await order.save();
    console.log(`[PayOS Webhook] Order ${order._id} updated to PAID successfully.`);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[PayOS Webhook] CRITICAL ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});

export default router;
