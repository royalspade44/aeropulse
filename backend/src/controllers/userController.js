const bcrypt = require("bcryptjs");
const User = require("../models/User");

const normalizePhone = (phone = "") => String(phone).replace(/\D/g, "");
const isValidPhMobile = (phone = "") => /^09\d{9}$/.test(normalizePhone(phone));

const formatAddressLine = (address = {}) => ([
  address.street,
  address.barangay,
  address.city,
  address.province,
  address.region,
]
  .map((part) => String(part || "").trim())
  .filter(Boolean)
  .join(", "));

const syncPrimaryAddressFromDefault = (user, addresses = []) => {
  const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0] || null;
  if (!defaultAddress) {
    user.billingAddress = { region: "", province: "", city: "", barangay: "", street: "" };
    user.address = "";
    return;
  }

  user.billingAddress = {
    region: String(defaultAddress.region || "").trim(),
    province: String(defaultAddress.province || "").trim(),
    city: String(defaultAddress.city || "").trim(),
    barangay: String(defaultAddress.barangay || "").trim(),
    street: String(defaultAddress.street || "").trim(),
  };
  user.address = formatAddressLine(defaultAddress);
};

const sanitizeAddressPayload = (payload = {}) => {
  const label = String(payload.label || "").trim();
  const type = ["home", "office", "other"].includes(payload.type) ? payload.type : "other";
  const name = String(payload.name || "").trim();
  const region = String(payload.region || "").trim();
  const province = String(payload.province || "").trim();
  const street = String(payload.street || "").trim();
  const barangay = String(payload.barangay || "").trim();
  const city = String(payload.city || "").trim();
  const postalCode = String(payload.postalCode || "").trim();
  const phone = normalizePhone(payload.phone || "");

  return {
    label,
    type,
    name,
    region,
    province,
    street,
    barangay,
    city,
    postalCode,
    phone,
    isDefault: Boolean(payload.isDefault),
  };
};
const validateAddress = (address = {}) => {
  if (!address.name) return "Recipient name is required.";
  if (!address.region) return "Region is required.";
  if (!address.province) return "Province is required.";
  if (!address.barangay) return "Barangay is required.";
  if (!address.street) return "Street address is required.";
  if (!address.city) return "City is required.";
  if (!address.phone) return "Phone number is required.";
  if (!/^09\d{9}$/.test(address.phone)) {
    return "Phone number must be in 09XXXXXXXXX format.";
  }
  if (address.postalCode && !/^\d{4}$/.test(address.postalCode)) {
    return "Postal code must be 4 digits.";
  }
  return "";
};
const normalizeDefaultAddress = (addresses = []) => {
  if (addresses.length === 0) return;
  const requestedDefaultIndex = addresses.findIndex((item) => item.isDefault);
  const defaultIndex = requestedDefaultIndex >= 0 ? requestedDefaultIndex : 0;
  addresses.forEach((item, index) => {
    item.isDefault = index === defaultIndex;
  });
};
const isStrongPassword = (value = "") => {
  const password = String(value);
  if (password.length < 8) return false;
  if (!/(?=.*[a-z])/.test(password)) return false;
  if (!/(?=.*[A-Z])/.test(password)) return false;
  if (!/(?=.*\d)/.test(password)) return false;
  if (!/(?=.*[@$!%*?&])/.test(password)) return false;
  return true;
};

const updateProfile = async (req, res) => {
  const { name, name_first, name_last, phone, address, avatarUrl, billingAddress } = req.body;
  const user = req.authUser;

  if (name !== undefined) user.name = name;
  if (name_first !== undefined) user.name_first = name_first;
  if (name_last !== undefined) user.name_last = name_last;
  if (phone !== undefined) {
    if (!isValidPhMobile(phone)) {
      return res.status(400).json({ message: "Invalid phone number format. Use 09XXXXXXXXX." });
    }
    user.phone = normalizePhone(phone);
  }
  if (address !== undefined) user.address = address;
  if (billingAddress !== undefined && billingAddress && typeof billingAddress === "object") {
    const normalizedBillingAddress = {
      region: String(billingAddress.region || "").trim(),
      province: String(billingAddress.province || "").trim(),
      city: String(billingAddress.city || "").trim(),
      barangay: String(billingAddress.barangay || "").trim(),
      street: String(billingAddress.street || "").trim(),
    };
    user.billingAddress = normalizedBillingAddress;
    user.address = formatAddressLine(normalizedBillingAddress) || user.address;
  }
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  await user.save();
  return res.json({ user: user.toJSON() });
};

const listAddresses = async (req, res) => {
  const addresses = Array.isArray(req.authUser.addresses) ? req.authUser.addresses : [];
  return res.json({ addresses });
};

const addAddress = async (req, res) => {
  const normalizedAddress = sanitizeAddressPayload(req.body || {});
  const validationError = validateAddress(normalizedAddress);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const user = req.authUser;
  const nextAddresses = Array.isArray(user.addresses) ? [...user.addresses] : [];
  const shouldSetDefault = normalizedAddress.isDefault || nextAddresses.length === 0;
  nextAddresses.push({ ...normalizedAddress, isDefault: shouldSetDefault });
  normalizeDefaultAddress(nextAddresses);
  user.addresses = nextAddresses;
  syncPrimaryAddressFromDefault(user, nextAddresses);

  await user.save();
  return res.status(201).json({ addresses: user.addresses });
};

const updateAddress = async (req, res) => {
  const addressId = String(req.params.addressId || "").trim();
  const user = req.authUser;
  const nextAddresses = Array.isArray(user.addresses) ? [...user.addresses] : [];
  const index = nextAddresses.findIndex((item) => String(item._id) === addressId);
  if (index < 0) {
    return res.status(404).json({ message: "Address not found." });
  }

  const normalizedAddress = sanitizeAddressPayload(req.body || {});
  const validationError = validateAddress(normalizedAddress);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  nextAddresses[index] = {
    ...nextAddresses[index].toObject(),
    ...normalizedAddress,
  };
  normalizeDefaultAddress(nextAddresses);
  user.addresses = nextAddresses;
  syncPrimaryAddressFromDefault(user, nextAddresses);

  await user.save();
  return res.json({ addresses: user.addresses });
};

const deleteAddress = async (req, res) => {
  const addressId = String(req.params.addressId || "").trim();
  const user = req.authUser;
  const nextAddresses = (Array.isArray(user.addresses) ? user.addresses : []).filter(
    (item) => String(item._id) !== addressId
  );

  if (nextAddresses.length === (user.addresses || []).length) {
    return res.status(404).json({ message: "Address not found." });
  }

  normalizeDefaultAddress(nextAddresses);
  user.addresses = nextAddresses;
  syncPrimaryAddressFromDefault(user, nextAddresses);
  await user.save();
  return res.json({ addresses: user.addresses });
};

const setDefaultAddress = async (req, res) => {
  const addressId = String(req.params.addressId || "").trim();
  const user = req.authUser;
  const nextAddresses = Array.isArray(user.addresses) ? [...user.addresses] : [];
  const exists = nextAddresses.some((item) => String(item._id) === addressId);
  if (!exists) {
    return res.status(404).json({ message: "Address not found." });
  }

  nextAddresses.forEach((item) => {
    item.isDefault = String(item._id) === addressId;
  });
  user.addresses = nextAddresses;
  syncPrimaryAddressFromDefault(user, nextAddresses);
  await user.save();
  return res.json({ addresses: user.addresses });
};

const updatePreferences = async (req, res) => {
  req.authUser.preferences = { ...req.authUser.preferences.toObject(), ...req.body };
  await req.authUser.save();
  return res.json({ user: req.authUser.toJSON() });
};

const updatePrivacy = async (req, res) => {
  req.authUser.privacy = { ...req.authUser.privacy.toObject(), ...req.body };
  await req.authUser.save();
  return res.json({ user: req.authUser.toJSON() });
};

const updateNotifications = async (req, res) => {
  req.authUser.notifications = { ...req.authUser.notifications.toObject(), ...req.body };
  await req.authUser.save();
  return res.json({ user: req.authUser.toJSON() });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password are required" });
  }

  if (!req.authUser.passwordHash) {
    return res.status(400).json({ message: "This account uses OAuth. Set a local password from account recovery flow." });
  }

  const valid = await bcrypt.compare(currentPassword, req.authUser.passwordHash);
  if (!valid) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      message: "New password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ message: "New password must be different from current password" });
  }

  req.authUser.passwordHash = await bcrypt.hash(newPassword, 10);
  await req.authUser.save();
  return res.json({ message: "Password changed successfully" });
};

const deleteAccount = async (req, res) => {
  await req.authUser.deleteOne();
  return res.json({ message: "Account deleted successfully" });
};

const listUsers = async (req, res) => {
  const role = req.query.role;
  const locked = req.query.locked;

  if (req.authUser.role !== "admin" && req.authUser.role !== "superadmin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const query = {};
  if (role) query.role = role;
  if (locked === "true") query.lockoutUntil = { $gt: new Date() };

  const users = await User.find(query).sort({ createdAt: -1 }).limit(500);
  return res.json({ users: users.map((u) => u.toJSON()) });
};

const unlockUser = async (req, res) => {
  if (req.authUser.role !== "admin" && req.authUser.role !== "superadmin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  user.failedLoginAttempts = 0;
  user.lockoutUntil = null;
  await user.save();
  return res.json({ user: user.toJSON() });
};

module.exports = {
  listUsers,
  updateProfile,
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  updatePreferences,
  updatePrivacy,
  updateNotifications,
  changePassword,
  deleteAccount,
  unlockUser,
};
