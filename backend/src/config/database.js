import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("✅ MongoDB already connected");
    return;
  }

  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined in environment variables");
    process.exit(1);
  }

  try {
    console.log("🔍 Using Google DNS (8.8.8.8, 8.8.4.4) for DNS resolution");

    const options = {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
    };

    mongoose.set("bufferCommands", false);

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    isConnected = true;

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(
      `🔗 Connection State: ${
        conn.connection.readyState === 1 ? "Connected" : "Disconnected"
      }`
    );

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB Connection Error:", err.message);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB Disconnected");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB Reconnected");
      isConnected = true;
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`📋 Error Details:`, error);
    isConnected = false;

    if (
      error.message.includes("ETIMEOUT") ||
      error.message.includes("ENOTFOUND")
    ) {
      console.error(
        "⚠️ DNS Resolution Failed - Check your internet connection"
      );
      console.error("💡 Tips:");
      console.error("   1. Check your internet connection");
      console.error("   2. Verify MongoDB Atlas cluster is accessible");
      console.error("   3. Try using a different DNS server (8.8.8.8)");
    }

    console.log("🔄 Retrying connection in 5 seconds...");
    setTimeout(() => {
      connectDB().catch((retryError) => {
        console.error("❌ Retry failed:", retryError.message);
        if (process.env.NODE_ENV !== "production") {
          process.exit(1);
        }
      });
    }, 5000);
  }
};

export default connectDB;
