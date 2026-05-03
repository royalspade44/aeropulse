const mongoose = require("mongoose");

const otpRequestSchema = new mongoose.Schema(
  {
    email: { type: String, lowercase: true, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    action: {
      type: String,
      enum: ["login", "register_email", "register_phone", "password_reset"],
      required: true,
    },
    channel: {
      type: String,
      enum: ["email", "sms"],
      required: true,
    },
    codeHash: { type: String, required: true },
    requestedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    verifiedAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

otpRequestSchema.index({ email: 1, action: 1, channel: 1 });
otpRequestSchema.index({ phone: 1, action: 1, channel: 1 });

module.exports = mongoose.model("OtpRequest", otpRequestSchema);
