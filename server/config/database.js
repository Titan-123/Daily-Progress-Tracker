import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // MongoDB connection string - can be configured via environment variables
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/daily-progress-tracker';
    
    const conn = await mongoose.connect(mongoURI, {
      // These options help with connection stability
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
