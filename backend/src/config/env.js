const dotenv = require("dotenv");

dotenv.config();

const parseCorsOrigins = (value = "") => {
  if (!value || !String(value).trim()) {
    return ["http://localhost:3000", "http://localhost:8081"];
  }
  return String(value)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aeropulse",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  corsOrigin: parseCorsOrigins(
    process.env.CORS_ORIGIN || "http://localhost:3000",
  ),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  openAiBaseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:5000/api/auth/google/callback",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure:
    String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || "",
  passwordResetTokenSecret:
    process.env.PASSWORD_RESET_TOKEN_SECRET ||
    process.env.JWT_SECRET ||
    "dev-secret",
  passwordResetTokenTtlMinutes: Number(
    process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 20,
  ),
  accountDeleteMode: process.env.ACCOUNT_DELETE_MODE || "soft",
  infobipApiKey: process.env.INFOBIP_API_KEY || "",
  infobipBaseUrl: process.env.INFOBIP_BASE_URL || "",
  infobipSender: process.env.INFOBIP_SENDER || "",
};

module.exports = env;
