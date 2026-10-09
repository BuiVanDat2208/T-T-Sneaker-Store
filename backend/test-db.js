import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

async function test() {
  console.log("Connecting to:", process.env.MONGODB_URI);
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("SUCCESS");
    process.exit(0);
  } catch (err) {
    console.error("FAILED:", err);
    process.exit(1);
  }
}
test();
