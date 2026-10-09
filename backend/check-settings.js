import dotenv from "dotenv";
import mongoose from "mongoose";
import { Setting } from "./src/models/Setting.js";
dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const settings = await Setting.find();
    console.log("Current Settings in DB:");
    console.log(JSON.stringify(settings, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
