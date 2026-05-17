const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const zxcvbn = require("zxcvbn");
const User = require("../models/User");
const OtpRequest = require("../models/OtpRequest");
const AuditLog = require("../models/AuditLog");
const { signAccessToken } = require("../utils/token");
const env = require("../config/env");
const { BRANCHES, resolvePreferredBranch } = require("../domain/branchRouting");
const { canSendEmail, sendEmail } = require("../utils/email");

const PASSWORD_RESET_MINUTES = Math.max(
  15,
  Math.min(30, Number(env.passwordResetTokenTtlMinutes || 20)),
);
const OTP_TTL_MINUTES = Math.max(
  3,
  Math.min(15, Number(env.otpTtlMinutes || 5)),
);

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();
const normalizeIdentifier = (value = "") => String(value).trim().toLowerCase();
const normalizePhone = (phone = "") => String(phone).replace(/\D/g, "");
const canonicalizePhMobile = (phone = "") => {
  const digits = normalizePhone(phone);
  if (/^639\d{9}$/.test(digits)) {
    return `09${digits.slice(3)}`;
  }
  return digits;
};
const isValidPhMobile = (phone = "") =>
  /^09\d{9}$/.test(canonicalizePhMobile(phone));
const isValidSixDigitCode = (value = "") =>
  /^\d{6}$/.test(String(value).trim());

const isStrongPassword = (value = "") => {
  const password = String(value);
  if (password.length < 12) return false;
  if (password.length > 72) return false;

  // Strength Check: Score < 65 is rejected (below 'Good')
  const strength = zxcvbn(password);
  const score = Math.floor(strength.guesses_log10 * 10);

  return score >= 65;
};

const validateLocationCoordinates = (coordinates = {}) => {
  const { latitude, longitude, accuracy } = coordinates;
  const errors = {};

  if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
    errors.latitude = "Invalid latitude";
  }
  if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
    errors.longitude = "Invalid longitude";
  }

  return { errors, valid: Object.keys(errors).length === 0 };
};

const normalizeLocation = (location = {}) => {
  const normalized = {
    coordinates: {
      latitude: null,
      longitude: null,
      accuracy: null,
      timestamp: null,
    },
    address: {
      region: "",
      province: "",
      city: "",
      barangay: "",
      street: "",
      postalCode: "",
    },
    source: "manual",
  };

  if (!location) return normalized;

  // Handle coordinates
  if (location.coordinates) {
    const { latitude, longitude, accuracy, timestamp } = location.coordinates;
    if (latitude !== undefined && latitude !== null)
      normalized.coordinates.latitude = Number(latitude);
    if (longitude !== undefined && longitude !== null)
      normalized.coordinates.longitude = Number(longitude);
    if (accuracy !== undefined && accuracy !== null)
      normalized.coordinates.accuracy = Number(accuracy);
    if (timestamp) normalized.coordinates.timestamp = String(timestamp);
  }

  // Handle address
  if (location.address) {
    const { region, province, city, barangay, street, postalCode } =
      location.address;
    if (region) normalized.address.region = String(region).trim();
    if (province) normalized.address.province = String(province).trim();
    if (city) normalized.address.city = String(city).trim();
    if (barangay) normalized.address.barangay = String(barangay).trim();
    if (street) normalized.address.street = String(street).trim();
    if (postalCode) normalized.address.postalCode = String(postalCode).trim();
  }

  // Set source
  if (location.source && ["gps", "manual", "ip"].includes(location.source)) {
    normalized.source = location.source;
  }

  return normalized;
};

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
      console.log(
        "[OTP] Email not configured. OTP code:",
        code,
        "for",
        recipient,
      );
    }
    return;
  }

  if (channel === "sms") {
    console.log("[OTP] SMS placeholder code:", code, "for", recipient);
    return;
  }
};

const createOtpRequest = async ({
  email = "",
  phone = "",
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
    action,
    channel,
    codeHash,
    requestedAt: now,
    expiresAt,
    metadata,
  });

  await sendOtpMessage({
    recipient:
      channel === "email"
        ? normalizeEmail(email)
        : channel === "sms"
          ? canonicalizePhMobile(phone)
          : req.body.messenger_handle,
    channel,
    action,
    code,
  });

  console.log("\n========================================");
  console.log(`[OTP] GENERATED FOR: ${channel.toUpperCase()}`);
  console.log(`ACTION: ${action}`);
  console.log(`RECIPIENT: ${email || phone || req.body.messenger_handle}`);
  console.log(`CODE: ${code}`);
  console.log("========================================\n");

  return otpRequest;
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
  if (messenger_handle) query["metadata.messenger_handle"] = messenger_handle;
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
  if (!otp) {
    return { ok: false, reason: "not_found" };
  }

  if (isOtpExpired(otp)) {
    return { ok: false, reason: "expired" };
  }

  const codeHash = hashValue(code);
  if (otp.codeHash !== codeHash) {
    return { ok: false, reason: "invalid" };
  }

  otp.verifiedAt = new Date();
  await otp.save();

  return { ok: true };
};

const signRegistrationSession = (data) => {
  return jwt.sign(data, env.jwtSecret, { expiresIn: "1h" });
};

const verifyRegistrationSession = (token) => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    return { ok: true, data: decoded };
  } catch (err) {
    return { ok: false, reason: "invalid" };
  }
};

const signRegistrationProgress = (progress) => {
  const payload = JSON.stringify(progress);
  const sig = crypto
    .createHmac("sha256", env.jwtSecret)
    .update(payload)
    .digest("hex");
  return `${payload}.${sig}`;
};

const verifyRegistrationProgress = (token) => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = crypto
    .createHmac("sha256", env.jwtSecret)
    .update(payload)
    .digest("hex");

  const isSigValid = crypto.timingSafeEqual(
    Buffer.from(sig, "hex"),
    Buffer.from(expected, "hex"),
  );
  if (!isSigValid) {
    return { ok: false, reason: "invalid" };
  }

  return {
    ok: true,
    tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
  };
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

  // ---------------------------------------------------------------------------
  // AUTHORITY CHECK: Persistent Session Recovery
  // ---------------------------------------------------------------------------

  // Case 1: Verified Registration Progress (Step 3+)
  // We check top-level session.registrationProgress
  const progress = req.session.registrationProgress;
  if (progress) {
    const progressEmail = normalizeEmail(
      progress.email || progress.formData?.email,
    );
    if (progressEmail === email) {
      const { registrationSecret, provisioningUri, verifiedCode } =
        progress.formData || {};
      if (registrationSecret) {
        console.log("\n========================================");
        console.log("TOTP SECRET RECOVERED FOR:", email);
        console.log("BASE32 SECRET:", registrationSecret);
        console.log("========================================\n");
        return res.json({
          email,
          secret: registrationSecret,
          provisioningUri,
          verifiedCode,
          message: "Resuming verified registration session.",
        });
      }
    }
  }

  // Case 2: In-Flight Verification (Step 2 - QR Code shown but not yet verified)
  // Check temporary session variables
  if (
    req.session.tempRegistrationSecret &&
    normalizeEmail(req.session.tempRegistrationEmail) === email
  ) {
    console.log("\n========================================");
    console.log("TOTP SECRET RECOVERED (IN-FLIGHT):", email);
    console.log("BASE32 SECRET:", req.session.tempRegistrationSecret);
    console.log("========================================\n");
    return res.json({
      email,
      secret: req.session.tempRegistrationSecret,
      provisioningUri: req.session.tempProvisioningUri,
      message: "Resuming in-flight verification.",
    });
  }

  // Case 3: Fresh Generation
  const secret = speakeasy.generateSecret({
    length: 20,
    name: `AeroPulse:${email}`,
  });

  console.log("\n========================================");
  console.log("TOTP SECRET GENERATED FOR:", email);
  console.log("BASE32 SECRET:", secret.base32);
  console.log("OTP AUTH URL:", secret.otpauth_url);
  console.log("========================================\n");

  req.session.tempRegistrationSecret = secret.base32;
  req.session.tempProvisioningUri = secret.otpauth_url;
  req.session.tempRegistrationEmail = email;

  return res.json({
    email,
    secret: secret.base32,
    provisioningUri: secret.otpauth_url,
    message: "TOTP secret generated.",
  });
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

const verifyRegistrationCode = async (req, res) => {
  const { email, code, secret } = req.body;
  const normalizedEmail = normalizeEmail(email);

  const verifySecret = secret || req.session.tempRegistrationSecret;

  if (!normalizedEmail || !code || !verifySecret) {
    return res
      .status(400)
      .json({ message: "Email, code, and secret are required." });
  }

  const isValid = speakeasy.totp.verify({
    secret: verifySecret,
    encoding: "base32",
    token: code,
    window: 1,
  });

  if (!isValid) {
    return res.status(400).json({
      message:
        "Invalid verification code. Please check your authenticator app.",
    });
  }

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

  const sessionToken = signRegistrationSession({
    email: normalizedEmail,
    verified: true,
  });

  return res.json({
    message: "Verification successful. You may now complete your profile.",
    sessionToken,
    registrationProgress: req.session.registrationProgress,
  });
};

const register = async (req, res) => {
  const {
    name,
    name_first,
    name_last,
    alias,
    email,
    phone,
    password,
    messenger_handle,
    address,
    billingAddress,
    role, // Allow explicit role specification for mobile
    branch, // Branch selection for staff roles
    location, // Location data: { coordinates, address, source }
    registrationToken, // Optional if not using cookies
  } = req.body;

  try {
    const normalizedEmail = normalizeEmail(email);

    // Verify registration permission
    // In cookie-session mode, we check req.session.registrationProgress
    if (
      !req.session.registrationProgress ||
      normalizeEmail(req.session.registrationProgress.email) !== normalizedEmail
    ) {
      return res.status(403).json({
        message: "Registration verification required or session expired.",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userRole = role || detectRoleFromEmail(normalizedEmail);
    const assignedBranch = branch || "";

    const newUser = await User.create({
      name: name || `${name_first} ${name_last}`,
      name_first,
      name_last,
      alias,
      email: normalizedEmail,
      phone,
      passwordHash,
      messenger_handle,
      address,
      billingAddress,
      role: userRole,
      assignedBranch,
      location: normalizeLocation(location),
      accountStatus: "active",
    });

    // Clear registration session
    delete req.session.registrationProgress;

    await AuditLog.create({
      action: "user_registered",
      user: newUser.id,
      entityType: "user",
      entityId: newUser.id,
      description: `New ${userRole} registered: ${normalizedEmail}`,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    const token = signAccessToken({ sub: newUser.id, role: newUser.role });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: newUser.toJSON(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering user" });
  }
};

const login = async (req, res) => {
  const { email, password, clientType = "web", branch } = req.body;

  try {
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.isDeleted) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.accountStatus !== "active") {
      return res.status(403).json({
        message: `Account is ${user.accountStatus}. Please contact support.`,
      });
    }

    // Check lockout
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const secondsLeft = Math.ceil((user.lockoutUntil - new Date()) / 1000);
      return res.status(423).json({
        message: `Too many failed attempts. Account locked. Try again in ${secondsLeft}s.`,
        data: { secondsLeft },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 3) {
        user.lockoutUntil = new Date(Date.now() + 60 * 1000); // 1 minute lockout
      }
      await user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Role-based branch validation
    let effectiveBranch = branch || "";
    if (clientType === "web") {
      effectiveBranch =
        user.role === "superadmin"
          ? ""
          : user.activeBranch
            ? user.activeBranch
            : user.assignedBranch;
    }

    if (["admin", "technician"].includes(user.role)) {
      if (!effectiveBranch || !BRANCHES.includes(effectiveBranch)) {
        return res
          .status(400)
          .json({ message: "A valid branch is required for this account." });
      }

      // Update activeBranch if different from selected
      if (effectiveBranch !== user.activeBranch) {
        user.activeBranch = effectiveBranch;
      }
    }

    // Reset failed attempts and update last login on success
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    user.lastLogin = new Date();
    await user.save();

    const token = signAccessToken({ sub: user.id, role: user.role });

    console.log("[Auth][Login] Success", {
      id: user.id,
      role: user.role,
      clientType,
      branch: effectiveBranch,
    });

    // Create audit log for successful login
    await AuditLog.create({
      action: "user_login",
      user: user.id,
      branch: effectiveBranch || "",
      entityType: "user",
      entityId: user.id,
      description: `${user.role} login from ${clientType}`,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    return res.json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error during login" });
  }
};

const logout = (req, res) => {
  req.session = null; // Clear cookie-session
  res.json({ message: "Logged out successfully" });
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.isDeleted || user.accountStatus !== "active") {
      return res.json({
        message: "If this email is registered, a reset code has been sent.",
      });
    }

    const otpRequest = await createOtpRequest({
      email: normalizedEmail,
      action: "password_reset",
      channel: "email",
    });

    return res.json({
      message: "One-time code sent.",
    });
  } catch (err) {
    res.status(500).json({ message: "Error requesting password reset" });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.sub);

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired reset token" });
  }
};

const resetPasswordWithCode = async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const normalizedEmail = normalizeEmail(email);
    const verification = await verifyOtpRequest({
      email: normalizedEmail,
      action: "password_reset",
      channel: "email",
      code,
    });

    if (!verification.ok) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password" });
  }
};

const requestOtp = async (req, res) => {
  const action = String(req.body?.action || "").trim();
  const email = normalizeEmail(req.body?.email);
  const phone = canonicalizePhMobile(req.body?.phone);
  const channel = String(
    req.body?.channel || (action === "register_phone" ? "sms" : "email"),
  ).trim();

  if (
    !action ||
    ![
      "register_email",
      "register_phone",
      "register_messenger",
      "password_reset",
    ].includes(action)
  ) {
    return res.status(400).json({ message: "Invalid OTP request action." });
  }

  if (action === "register_email" && !email) {
    return res
      .status(400)
      .json({ message: "Email is required to request registration OTP." });
  }

  if (action === "register_phone" && !phone) {
    return res.status(400).json({
      message: "Phone number is required to request registration OTP.",
    });
  }

  if (action === "register_messenger" && !req.body.messenger_handle) {
    return res.status(400).json({
      message: "Messenger handle is required to request registration OTP.",
    });
  }

  if (action === "password_reset" && !email) {
    return res
      .status(400)
      .json({ message: "Email is required to request password reset OTP." });
  }

  if (action === "register_email") {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }
  }

  if (action === "register_phone") {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({
        message: "An account with this mobile number already exists.",
      });
    }
  }

  if (action === "password_reset") {
    const user = await User.findOne({ email });
    if (!user || user.isDeleted || user.accountStatus !== "active") {
      return res.json({
        message: "If this email is registered, a reset code has been sent.",
      });
    }
  }

  const metadata = {};
  if (action === "register_messenger") {
    metadata.messenger_handle = req.body.messenger_handle;
  }

  const otpRequest = await createOtpRequest({
    email,
    phone,
    action,
    channel,
    metadata,
  });
  return res.json({
    message: "One-time code sent.",
    action,
  });
};

const verifyOtp = async (req, res) => {
  const action = String(req.body?.action || "").trim();
  const email = normalizeEmail(req.body?.email);
  const phone = canonicalizePhMobile(req.body?.phone);
  const code = String(req.body?.code || "").trim();
  const branch = String(req.body?.branch || "").trim();
  const newPassword = String(req.body?.new_password || "").trim();
  const channel = action === "register_phone" ? "sms" : "email";

  if (!action || !code) {
    return res
      .status(400)
      .json({ message: "Verification action and code are required." });
  }

  if (!isValidSixDigitCode(code)) {
    return res
      .status(400)
      .json({ message: "Invalid verification code format." });
  }

  const verification = await verifyOtpRequest({
    email,
    phone,
    action,
    channel,
    code,
    messenger_handle: req.body.messenger_handle,
  });
  if (!verification.ok) {
    if (verification.reason === "expired") {
      return res.status(410).json({ message: "This code has expired." });
    }
    return res.status(400).json({ message: "Invalid verification code." });
  }

  if (
    action === "register_email" ||
    action === "register_phone" ||
    action === "register_messenger"
  ) {
    // -------------------------------------------------------------------------
    // Persistent Session Sync: Flag the identity as verified in the session
    // -------------------------------------------------------------------------
    if (req.session.registrationProgress) {
      if (action === "register_phone") {
        req.session.registrationProgress.formData.phone = phone;
        req.session.registrationProgress.formData.phoneVerified = true;
      } else if (action === "register_messenger") {
        req.session.registrationProgress.formData.messengerHandle =
          req.body.messenger_handle;
        req.session.registrationProgress.formData.messengerVerified = true;
      }
    }

    return res.json({ message: "Verification successful." });
  }

  if (action === "login") {
    const user = await User.findOne({
      $or: [
        { email: normalizeEmail(email) },
        { phone: canonicalizePhMobile(phone) },
      ],
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = signAccessToken({ sub: user.id, role: user.role });
    return res.json({ success: true, token, user: user.toJSON() });
  }

  return res.status(400).json({ message: "Unhandled OTP verification action" });
};

const detectRoleFromEmail = (email = "") => {
  const lower = normalizeEmail(email);
  if (lower.includes("superadmin")) return "superadmin";
  if (lower.includes("admin")) return "admin";
  if (lower.includes("technician")) return "technician";
  return "customer";
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
