// Load .env from the backend folder (one level up from src)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = require("./app");
const env = require("./config/env");
const connectDb = require("./config/db");
const { seedDemoUsers } = require("./seed/seedDemoUsers");
const { seedDashboardData } = require("./seed/seedDashboardData");

// Debug - check if it loaded
console.log("MONGODB_URI loaded:", process.env.MONGODB_URI ? "YES" : "NO");

const start = async () => {
  await connectDb();
  await seedDemoUsers();
  await seedDashboardData();
  app.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});