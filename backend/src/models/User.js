const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    type: { type: String, enum: ["home", "office", "other"], default: "home" },
    name: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    region: { type: String, default: "", trim: true },
    province: { type: String, default: "", trim: true },
    street: { type: String, default: "", trim: true },
    barangay: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    postalCode: { type: String, default: "", trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const billingAddressSchema = new mongoose.Schema(
  {
    region: { type: String, default: "", trim: true },
    province: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    barangay: { type: String, default: "", trim: true },
    street: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    name_first: { type: String, required: true, trim: true },
    name_last: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: { type: String, unique: true, sparse: true },
    avatarUrl: { type: String, default: "" },
    role: {
      type: String,
      enum: ["customer", "admin", "technician", "superadmin"],
      default: "customer",
    },
    address: { type: String, default: "" },
    billingAddress: { type: billingAddressSchema, default: () => ({}) },
    addresses: [addressSchema],
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
    assignedBranch: { type: String, default: "" },
    activeBranch: { type: String, default: "" },
    lastLogin: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date, default: null },
    passwordReset: {
      tokenHash: { type: String, default: "" },
      expiresAt: { type: Date, default: null },
      usedAt: { type: Date, default: null },
      requestedAt: { type: Date, default: null },
    },
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
