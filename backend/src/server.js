import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import adminRoutes from "./routes/admin.js";
import analyticsRoutes from "./routes/analytics.js";
import authRoutes from "./routes/auth.js";
import chatbotRoutes from "./routes/chatbot.js";
import categoryRoutes from "./routes/categories.js";
import orderRoutes from "./routes/orders.js";
import productRoutes from "./routes/products.js";
import reviewRoutes from "./routes/reviews.js";
import userRoutes from "./routes/users.js";
import brandRoutes from "./routes/brands.js";
import uploadRoutes from "./routes/upload.js";
import settingRoutes from "./routes/settings.js";
import webhookRoutes from "./routes/webhooks.js";
import { connectDb, disconnectDb } from "./config/db.js";
import { configureCloudinary } from "./config/cloudinary.js";
import { errorHandler, notFound } from "./middleware/error.js";

dotenv.config();
configureCloudinary();

const app = express();
const port = Number(process.env.PORT || 4000);
let activeServer;

function startServer(currentPort, attempts = 0) {
  const server = app.listen(currentPort, () => {
    activeServer = server;
    console.log(`API running on http://localhost:${currentPort}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && attempts < 10) {
      const fallbackPort = currentPort + 1;
      console.warn(`Port ${currentPort} is busy. Retrying on ${fallbackPort}.`);
      startServer(fallbackPort, attempts + 1);
      return;
    }

    console.error("API server failed to start:", error);
    process.exitCode = 1;
  });
}

async function shutdown(signal) {
  console.log(`${signal} received; shutting down backend.`);
  try {
    if (activeServer) {
      await new Promise((resolve, reject) => {
        activeServer.close((error) => error ? reject(error) : resolve());
      });
    }
    await disconnectDb();
  } catch (error) {
    console.error("Backend shutdown failed:", error);
    process.exitCode = 1;
  }
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

// app.use(helmet({ crossOriginResourcePolicy: false }));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));
app.use("/uploads", express.static("uploads"));

app.get("/health", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    ok: databaseConnected,
    service: "tt-sneaker-store-api",
    database: databaseConnected ? "connected" : "disconnected"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use(notFound);
app.use(errorHandler);

connectDb()
  .then(() => {
    startServer(port);
  })
  .catch((error) => {
    console.error("Backend startup failed because MongoDB could not be started:", error);
    process.exitCode = 1;
  });
