const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aeropulse",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback",
};

module.exports = env;
