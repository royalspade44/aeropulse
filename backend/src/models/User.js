const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    name_first: { type: String, required: true, trim: true },
    name_last: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "admin", "technician", "superadmin"],
      default: "customer",
    },
    address: { type: String, default: "" },
    preferences: {
      language: { type: String, default: "English" },
      currency: { type: String, default: "PHP" },
      timezone: { type: String, default: "Asia/Manila" },
      darkMode: { type: Boolean, default: false },
      autoBook: { type: Boolean, default: true },
    },
    privacy: {
      profileVisibility: { type: String, default: "public" },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
      activityStatus: { type: Boolean, default: true },
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      promotions: { type: Boolean, default: true },
      serviceUpdates: { type: Boolean, default: true },
    },
    skills: [{ type: String }],
    permissions: [{ type: String }],
    department: { type: String },
    lastLogin: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
