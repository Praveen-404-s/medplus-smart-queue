const mongoose = require('mongoose');

let isConnectedToMongo = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnectedToMongo = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnectedToMongo = false;
    console.warn(`⚠️ MongoDB connection error: ${error.message}`);
    console.warn(`ℹ️ Operating with MongoDB fallback storage mode. Start your MongoDB server to persist to database.`);
  }
};

const getMongoStatus = () => isConnectedToMongo;

module.exports = { connectDB, getMongoStatus };
