const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signAccessToken } = require("../utils/token");

const register = async (req, res) => {
  const {
    email,
    password,
    name,
    name_first,
    name_last,
    phone,
    address = "",
    role = "customer",
  } = req.body;

  if (!email || !password || !name_first || !name_last || !phone) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    return res.status(409).json({ message: "Email or phone already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    passwordHash,
    name: name || `${name_first} ${name_last}`.trim(),
    name_first,
    name_last,
    phone,
    address,
    role,
  });

  const token = signAccessToken({ sub: user.id, role: user.role });
  return res.status(201).json({ token, user: user.toJSON() });
};

const login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Email not found. Please register first." });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Incorrect password. Please try again." });
  }

  if (role && user.role !== role) {
    return res.status(403).json({ message: `Access denied. This account is not registered as a ${role}.` });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = signAccessToken({ sub: user.id, role: user.role });
  return res.json({ token, user: user.toJSON() });
};

const me = async (req, res) => {
  return res.json({ user: req.authUser.toJSON() });
};

module.exports = { register, login, me };
