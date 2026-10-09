import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const localDbPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../.local-mongodb");
const localMongoUri = "mongodb://127.0.0.1:27018/tt-sneaker-store";
let localMongoServer;

async function connectLocalMongo() {
  await mkdir(localDbPath, { recursive: true });
  let server;

  try {
    server = await MongoMemoryServer.create({
      instance: {
        port: 27018,
        dbName: "tt-sneaker-store",
        dbPath: localDbPath
      }
    });
  } catch (startError) {
    try {
      await mongoose.connect(localMongoUri, { serverSelectionTimeoutMS: 2000 });
      console.warn("Using the already-running local MongoDB development database.");
      return;
    } catch (connectError) {
      console.error("Could not connect to an existing local MongoDB development database:", connectError);
      throw startError;
    }
  }

  try {
    await mongoose.connect(server.getUri());
    localMongoServer = server;
    console.log(`Local MongoDB connected (${localDbPath})`);
  } catch (error) {
    await server.stop();
    throw error;
  }
}

export async function connectDb() {
  mongoose.set("strictQuery", true);

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("MONGODB_URI is required in production");
    }

    console.warn("MONGODB_URI is not configured; using the persistent local development database.");
    await connectLocalMongo();
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected");
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }

    console.error("Configured MongoDB is unavailable; falling back to the persistent local development database.", error.message);
    await connectLocalMongo();
  }
}

export async function disconnectDb() {
  try {
    await mongoose.disconnect();
  } finally {
    await localMongoServer?.stop();
    localMongoServer = undefined;
  }
}
