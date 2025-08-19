import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // MongoDB connection string - can be configured via environment variables
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/daily-progress-tracker"; 

    console.log("🔄 Attempting to connect to MongoDB...",mongoURI);

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
  

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn("⚠️  MongoDB connection failed:", error.message);
    console.log("📋 App will continue using fallback data storage");
    // Don't exit the process, just continue without MongoDB
    return null;
  }
};

export default connectDB;
