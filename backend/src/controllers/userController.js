const bcrypt = require("bcryptjs");
const User = require("../models/User");

const normalizePhone = (phone = "") => String(phone).replace(/\D/g, "");
const isValidPhMobile = (phone = "") => /^09\d{9}$/.test(normalizePhone(phone));
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
  const { name, name_first, name_last, phone, address, avatarUrl } = req.body;
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
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  await user.save();
  return res.json({ user: user.toJSON() });
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
  updatePreferences,
  updatePrivacy,
  updateNotifications,
  changePassword,
  deleteAccount,
  unlockUser,
};
