const mongoose = require("mongoose");
const env = require("./env");

const connectDb = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log(`MongoDB connected: ${env.mongoUri}`);
  } catch (error) {
    console.error(`Failed to connect to MongoDB at ${env.mongoUri}`);
    console.error("Start MongoDB or set MONGODB_URI in backend/.env to a reachable database.");
    throw error;
  }
};

module.exports = connectDb;
