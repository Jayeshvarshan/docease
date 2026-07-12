import mongoose from "mongoose";

let cached = null;

const connectDB = async () => {
  if (cached) return cached;

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI + "/medicohub");
    cached = conn;
    console.log("✅ Database Connected Successfully");
    return conn;
  } catch (error) {
    console.error("❌ Database Connection Error:", error);
    throw error;
  }
};

export default connectDB;
