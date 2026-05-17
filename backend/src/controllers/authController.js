const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const zxcvbn = require("zxcvbn");
const User = require("../models/User");
const OtpRequest = require("../models/OtpRequest"); // Symmetrical V3 Model
const AuditLog = require("../models/AuditLog");
const { signAccessToken } = require("../utils/token");
const env = require("../config/env");
const { BRANCHES } = require("../domain/branchRouting");
const { canSendEmail, sendEmail } = require("../utils/email");

const OTP_TTL_MINUTES = Math.max(
  3,
  Math.min(15, Number(env.otpTtlMinutes || 5)),
);

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();
const normalizePhone = (phone = "") => String(phone).replace(/\D/g, "");
const canonicalizePhMobile = (phone = "") => {
  const digits = normalizePhone(phone);
  if (/^639\d{9}$/.test(digits)) return `09${digits.slice(3)}`;
  return digits;
};
const isValidSixDigitCode = (value = "") =>
  /^\d{6}$/.test(String(value).trim());

const generateOtpCode = () =>
  String(Math.floor(100000 + Math.random() * 900000)).padStart(6, "0");
const hashValue = (value = "") =>
  crypto.createHash("sha256").update(String(value)).digest("hex");
const isOtpExpired = (otp) =>
  !otp || !otp.expiresAt || otp.expiresAt.getTime() < Date.now();

const sendOtpMessage = async ({ recipient, channel, action, code }) => {
  const subject = `Your AeroPulse verification code`;
  const message = `Your AeroPulse ${action.replace("_", " ")} code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`;

  if (channel === "email") {
    if (canSendEmail()) {
      await sendEmail({
        to: recipient,
        subject,
        text: `${message}\n\nIf you did not request this, ignore this message.`,
        html: `<p>${message}</p><p>If you did not request this, ignore this message.</p>`,
      });
    } else {
      console.log("[OTP] Email code:", code, "for", recipient);
    }
    return;
  }

  if (channel === "sms") {
    console.log("[OTP] SMS code:", code, "for", recipient);
    return;
  }

  if (channel === "messenger") {
    console.log("[OTP] Messenger code:", code, "for", recipient);
    return;
  }
};

/**
 * SYMMETRICAL OTP HELPERS
 */
const createOtpRequest = async ({
  email = "",
  phone = "",
  messenger_handle = "",
  action,
  channel,
  metadata = {},
}) => {
  const code = generateOtpCode();
  const codeHash = hashValue(code);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);

  const otpRequest = await OtpRequest.create({
    email: normalizeEmail(email),
    phone: canonicalizePhMobile(phone),
    messenger_handle: String(messenger_handle || "").trim(),
    action,
    channel,
    codeHash,
    requestedAt: now,
    expiresAt,
    metadata,
  });

  await sendOtpMessage({
    recipient: email || phone || messenger_handle,
    channel,
    action,
    code,
  });

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log(
    "║ [OTP] GENERATED FOR:",
    channel.toUpperCase().padEnd(26, " "),
    "║",
  );
  console.log("║ ACTION:   ", action.padEnd(42, " "), "║");
  console.log(
    "║ RECIPIENT:",
    (email || phone || messenger_handle).padEnd(42, " "),
    "║",
  );
  console.log("║ CODE:     ", code.padEnd(42, " "), "║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  return { otpRequest, code };
};

const findOtpRequest = async ({
  email = "",
  phone = "",
  messenger_handle = "",
  action,
  channel,
}) => {
  const query = { action, channel, verifiedAt: null };
  if (email) query.email = normalizeEmail(email);
  if (phone) query.phone = canonicalizePhMobile(phone);
  if (messenger_handle)
    query.messenger_handle = String(messenger_handle).trim();
  return OtpRequest.findOne(query).sort({ createdAt: -1 });
};

const verifyOtpRequest = async ({
  email = "",
  phone = "",
  messenger_handle = "",
  action,
  channel,
  code,
}) => {
  const otp = await findOtpRequest({
    email,
    phone,
    messenger_handle,
    action,
    channel,
  });
  if (!otp) return { ok: false, reason: "not_found" };
  if (isOtpExpired(otp)) return { ok: false, reason: "expired" };

  if (otp.codeHash !== hashValue(code)) return { ok: false, reason: "invalid" };

  otp.verifiedAt = new Date();
  await otp.save();
  return { ok: true };
};

/**
 * PRIMARY CONTROLLERS
 */
const requestOtp = async (req, res) => {
  const { action, channel, email, phone, messenger_handle } = req.body;

  if (!action || !channel) {
    return res
      .status(400)
      .json({ message: "Action and channel are required." });
  }

  // 1. Validation for specific actions
  if (action === "register_email" && !email) {
    return res.status(400).json({ message: "Email required." });
  }
  if (action === "register_phone" && !phone) {
    return res.status(400).json({ message: "Phone required." });
  }
  if (action === "register_messenger" && !messenger_handle) {
    return res.status(400).json({ message: "Messenger handle required." });
  }

  // 2. Uniqueness checks
  if (
    action === "register_email" &&
    (await User.findOne({ email: normalizeEmail(email) }))
  ) {
    return res.status(409).json({ message: "Email already exists." });
  }
  if (
    action === "register_phone" &&
    (await User.findOne({ phone: canonicalizePhMobile(phone) }))
  ) {
    return res.status(409).json({ message: "Phone already exists." });
  }

  try {
    const { code } = await createOtpRequest({
      email,
      phone,
      messenger_handle,
      action,
      channel,
    });

    return res.json({ message: "Code sent successfully.", debugCode: code });
  } catch (err) {
    console.error("[OTP] Error:", err);
    return res.status(500).json({ message: "Error processing OTP request." });
  }
};

const verifyOtp = async (req, res) => {
  const { action, channel, email, phone, messenger_handle, code } = req.body;

  if (!action || !code) {
    return res.status(400).json({ message: "Action and code required." });
  }

  try {
    const verification = await verifyOtpRequest({
      email,
      phone,
      messenger_handle,
      action,
      channel,
      code,
    });

    if (!verification.ok) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    // Persistent Session Sync
    if (req.session.registrationProgress) {
      const data = req.session.registrationProgress.formData;
      if (action === "register_phone") {
        data.phone = canonicalizePhMobile(phone);
        data.phoneVerified = true;
      } else if (action === "register_messenger") {
        data.messengerHandle = messenger_handle;
        data.messengerVerified = true;
      }
    }

    return res.json({ message: "Verification successful." });
  } catch (err) {
    console.error("[OTP] Verify Error:", err);
    return res.status(500).json({ message: "Error verifying OTP." });
  }
};

const startRegistration = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res
      .status(400)
      .json({ errors: { email: "Valid email is required" } });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ errors: { email: "Email already exists" } });
  }

  let finalSecret = "";
  let finalUri = "";
  let verifiedCode = null;

  const progress = req.session.registrationProgress;
  if (
    progress &&
    normalizeEmail(progress.email || progress.formData?.email) === email
  ) {
    if (progress.formData?.registrationSecret) {
      finalSecret = progress.formData.registrationSecret;
      finalUri = progress.formData.provisioningUri;
      verifiedCode = progress.formData.verifiedCode;
    }
  }

  if (
    !finalSecret &&
    req.session.tempRegistrationSecret &&
    normalizeEmail(req.session.tempRegistrationEmail) === email
  ) {
    finalSecret = req.session.tempRegistrationSecret;
    finalUri = req.session.tempProvisioningUri;
  }

  if (!finalSecret) {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `AeroPulse:${email}`,
    });
    finalSecret = secret.base32;
    finalUri = secret.otpauth_url;

    req.session.tempRegistrationSecret = finalSecret;
    req.session.tempProvisioningUri = finalUri;
    req.session.tempRegistrationEmail = email;
  }

  const currentToken = speakeasy.totp({
    secret: finalSecret,
    encoding: "base32",
  });

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║ [TOTP] SECRET FOR:", email.padEnd(33, " "), "║");
  console.log("║ BASE32 SECRET:    ", finalSecret.padEnd(33, " "), "║");
  console.log("║ CURRENT TOKEN:    ", currentToken.padEnd(33, " "), "║");
  if (verifiedCode)
    console.log("║ STATUS:            ALREADY VERIFIED".padEnd(55, " "), "║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  return res.json({
    email,
    secret: finalSecret,
    provisioningUri: finalUri,
    verifiedCode,
  });
};

const verifyRegistrationCode = async (req, res) => {
  const { email, code, secret } = req.body;
  const normalizedEmail = normalizeEmail(email);
  const verifySecret = secret || req.session.tempRegistrationSecret;

  if (!normalizedEmail || !code || !verifySecret) {
    return res.status(400).json({ message: "Data required." });
  }

  const isValid = speakeasy.totp.verify({
    secret: verifySecret,
    encoding: "base32",
    token: code,
    window: 1,
  });
  if (!isValid) return res.status(400).json({ message: "Invalid code." });

  req.session.registrationProgress = {
    email: normalizedEmail,
    stepIndex: 3,
    formData: {
      email: normalizedEmail,
      registrationSecret: verifySecret,
      provisioningUri:
        req.body.provisioningUri || req.session.tempProvisioningUri,
      verifiedCode: code,
    },
  };

  delete req.session.tempRegistrationSecret;
  delete req.session.tempProvisioningUri;
  delete req.session.tempRegistrationEmail;

  return res.json({
    message: "Success",
    registrationProgress: req.session.registrationProgress,
  });
};

const register = async (req, res) => {
  const {
    name_first,
    name_last,
    alias,
    email,
    phone,
    password,
    messenger_handle,
    address,
    billingAddress,
    role,
    branch,
    location,
  } = req.body;
  try {
    const normalizedEmail = normalizeEmail(email);
    if (
      !req.session.registrationProgress ||
      normalizeEmail(req.session.registrationProgress.email) !== normalizedEmail
    ) {
      return res.status(403).json({ message: "Session expired." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: `${name_first} ${name_last}`,
      name_first,
      name_last,
      alias,
      email: normalizedEmail,
      phone: canonicalizePhMobile(phone),
      passwordHash,
      messenger_handle,
      role: role || "customer",
      assignedBranch: branch || "",
      address,
      billingAddress,
      location,
      accountStatus: "active",
    });

    delete req.session.registrationProgress;
    const token = signAccessToken({ sub: newUser.id, role: newUser.role });
    return res.json({ success: true, token, user: newUser.toJSON() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  const { email, password, branch } = req.body;
  try {
    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = signAccessToken({ sub: user.id, role: user.role });
    return res.json({ success: true, token, user: user.toJSON() });
  } catch (err) {
    return res.status(500).json({ message: "Login error" });
  }
};

const logout = async (req, res) => {
  req.session = null;
  res.json({ success: true });
};

const getSession = async (req, res) => {
  return res.json({
    session: {
      registrationProgress: req.session.registrationProgress || null,
      cart: req.session.cart || [],
    },
  });
};

const updateRegistrationProgress = async (req, res) => {
  req.session.registrationProgress = req.body.progress;
  return res.json({ success: true });
};

const updateCart = async (req, res) => {
  req.session.cart = req.body.cart;
  return res.json({ success: true });
};

const me = async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

const requestPasswordReset = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "If email exists, code sent." });
  const { code } = await createOtpRequest({
    email,
    action: "password_reset",
    channel: "email",
  });
  res.json({ message: "Code sent.", debugCode: code });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.sub);
    if (!user) return res.status(404).json({ message: "User not found" });
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    await user.save();
    res.json({ message: "Success" });
  } catch (err) {
    res.status(400).json({ message: "Invalid token." });
  }
};

const resetPasswordWithCode = async (req, res) => {
  const { email, code, newPassword } = req.body;
  const verification = await verifyOtpRequest({
    email: normalizeEmail(email),
    action: "password_reset",
    channel: "email",
    code,
  });
  if (!verification.ok)
    return res.status(400).json({ message: "Invalid code." });
  const user = await User.findOne({ email: normalizeEmail(email) });
  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();
  res.json({ message: "Success" });
};

module.exports = {
  startRegistration,
  verifyRegistrationCode,
  register,
  login,
  logout,
  me,
  requestPasswordReset,
  resetPassword,
  requestOtp,
  verifyOtp,
  resetPasswordWithCode,
  getSession,
  updateRegistrationProgress,
  updateCart,
};
