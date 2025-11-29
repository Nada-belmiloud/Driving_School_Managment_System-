// project/lib/mongodb.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error("Please define MONGO_URI in .env");

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var __mongoose_cached__: any;
}

const cached = (global as any).__mongoose_cached__ ?? (global as any).__mongoose_cached__ = { conn: null as typeof mongoose | null, promise: null as Promise<typeof mongoose> | null };

export default async function connectToDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
