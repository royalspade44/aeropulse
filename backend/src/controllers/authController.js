const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const OtpRequest = require("../models/OtpRequest");
const { signAccessToken } = require("../utils/token");
const env = require("../config/env");
const { BRANCHES, resolvePreferredBranch } = require("../domain/branchRouting");
const { canSendEmail, sendEmail } = require("../utils/email");

const PASSWORD_RESET_MINUTES = Math.max(15, Math.min(30, Number(env.passwordResetTokenTtlMinutes || 20)));
const OTP_TTL_MINUTES = Math.max(3, Math.min(15, Number(env.otpTtlMinutes || 5)));

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
const isValidPhMobile = (phone = "") => /^09\d{9}$/.test(canonicalizePhMobile(phone));
const isValidSixDigitCode = (value = "") => /^\d{6}$/.test(String(value).trim());
const isStrongPassword = (value = "") => {
  const password = String(value);
  if (password.length < 8) return false;
  if (!/(?=.*[a-z])/.test(password)) return false;
  if (!/(?=.*[A-Z])/.test(password)) return false;
  if (!/(?=.*\d)/.test(password)) return false;
  if (!/(?=.*[@$!%*?&])/.test(password)) return false;
  return true;
};

const validateLocationCoordinates = (coordinates = {}) => {
  const { latitude, longitude, accuracy } = coordinates;
  const errors = {};

  if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
    errors.latitude = "Latitude must be between -90 and 90";
  }
  if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
    errors.longitude = "Longitude must be between -180 and 180";
  }
  if (accuracy !== undefined && accuracy < 0) {
    errors.accuracy = "Accuracy must be non-negative";
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

const normalizeLocationData = (location = {}) => {
  const normalized = {
    coordinates: {},
    address: {},
    capturedAt: new Date(),
    source: "manual",
  };

  // Normalize coordinates
  if (location.coordinates) {
    const { latitude, longitude, accuracy, timestamp } = location.coordinates;
    if (typeof latitude === "number" && latitude >= -90 && latitude <= 90) {
      normalized.coordinates.latitude = latitude;
    }
    if (typeof longitude === "number" && longitude >= -180 && longitude <= 180) {
      normalized.coordinates.longitude = longitude;
    }
    if (typeof accuracy === "number" && accuracy >= 0) {
      normalized.coordinates.accuracy = accuracy;
    }
    if (timestamp) {
      normalized.coordinates.timestamp = new Date(timestamp);
    }
  }

  // Normalize address
  if (location.address) {
    const { region, province, city, barangay, street, postalCode } = location.address;
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

const generateOtpCode = () => String(Math.floor(100000 + Math.random() * 900000)).padStart(6, "0");
const hashValue = (value = "") => crypto.createHash("sha256").update(String(value)).digest("hex");
const isOtpExpired = (otp) => !otp || !otp.expiresAt || otp.expiresAt.getTime() < Date.now();

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
      console.log("[OTP] Email not configured. OTP code:", code, "for", recipient);
    }
    return;
  }

  if (channel === "sms") {
    console.log("[OTP] SMS placeholder code:", code, "for", recipient);
    return;
  }
};

const createOtpRequest = async ({ email = "", phone = "", action, channel, metadata = {} }) => {
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
    recipient: channel === "email" ? normalizeEmail(email) : canonicalizePhMobile(phone),
    channel,
    action,
    code,
  });

  return otpRequest;
};

const findOtpRequest = async ({ email = "", phone = "", action, channel }) => {
  const query = { action, channel, verifiedAt: null };
  if (email) query.email = normalizeEmail(email);
  if (phone) query.phone = canonicalizePhMobile(phone);
  return OtpRequest.findOne(query).sort({ createdAt: -1 });
};

const verifyOtpRequest = async ({ email = "", phone = "", action, channel, code }) => {
  const otp = await findOtpRequest({ email, phone, action, channel });
  if (!otp) {
    return { ok: false, reason: "not_found" };
  }
  if (isOtpExpired(otp)) {
    return { ok: false, reason: "expired" };
  }

  otp.attempts = (otp.attempts || 0) + 1;
  const isValid = hashValue(code) === otp.codeHash;
  if (!isValid) {
    await otp.save();
    return { ok: false, reason: "invalid" };
  }

  otp.verifiedAt = new Date();
  await otp.save();
  return { ok: true, otp };
};

const normalizeBillingAddress = (payload = {}) => ({
  region: String(payload.region || "").trim(),
  province: String(payload.province || "").trim(),
  city: String(payload.city || "").trim(),
  barangay: String(payload.barangay || "").trim(),
  street: String(payload.street || "").trim(),
});

const escapeRegExp = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUserByIdentifier = async (identifier = "") => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  if (!normalizedIdentifier) return null;

  const emailQuery = { email: normalizedIdentifier };
  const usernameQuery = { username: normalizedIdentifier };

  return User.findOne({ $or: [emailQuery, usernameQuery] });
};

const formatBillingAddress = (billingAddress = {}) => ([
  billingAddress.street,
  billingAddress.barangay,
  billingAddress.city,
  billingAddress.province,
  billingAddress.region,
]
  .filter(Boolean)
  .join(", "));

const isBillingAddressComplete = (billingAddress = {}) => {
  if (!billingAddress.region) return false;
  if (!billingAddress.province) return false;
  if (!billingAddress.city) return false;
  if (!billingAddress.barangay) return false;
  if (!billingAddress.street) return false;
  return true;
};

const detectRoleFromEmail = (email = "") => {
  const normalizedEmail = String(email).trim().toLowerCase();
  if (normalizedEmail.includes("superadmin")) return "superadmin";
  if (normalizedEmail.includes("technician") || normalizedEmail.includes("tech")) return "technician";
  if (normalizedEmail.includes("admin")) return "admin";
  return "customer";
};

const lockoutSecondsForAttemptCount = (attempts) => {
  if (attempts < 3) return 0;
  const ms = 60_000 + (attempts - 3) * 30_000;
  return Math.ceil(ms / 1000);
};

const getOAuthCookieOptions = (req) => ({
  httpOnly: true,
  sameSite: "lax",
  secure: Boolean(req.secure || String(env.frontendUrl || "").startsWith("https://")),
  maxAge: 10 * 60 * 1000,
  path: "/",
});

const generatePasswordResetToken = () => {
  const nonce = crypto.randomBytes(24).toString("hex");
  const createdAt = Date.now().toString();
  const payload = `${nonce}.${createdAt}`;
  const signature = crypto
    .createHmac("sha256", env.passwordResetTokenSecret)
    .update(payload)
    .digest("hex");
  const token = `${payload}.${signature}`;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
};

const parseAndVerifyPasswordResetToken = (token = "") => {
  const [nonce = "", createdAtRaw = "", signature = ""] = String(token).split(".");
  if (!nonce || !createdAtRaw || !signature) {
    return { ok: false, reason: "invalid" };
  }
  if (!/^\d+$/.test(createdAtRaw)) {
    return { ok: false, reason: "invalid" };
  }

  const payload = `${nonce}.${createdAtRaw}`;
  const expected = crypto
    .createHmac("sha256", env.passwordResetTokenSecret)
    .update(payload)
    .digest("hex");

  if (!/^[a-f0-9]+$/i.test(signature) || signature.length !== expected.length) {
    return { ok: false, reason: "invalid" };
  }

  const isSigValid = crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
  if (!isSigValid) {
    return { ok: false, reason: "invalid" };
  }

  return {
    ok: true,
    tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
  };
};

const clearPasswordResetState = (user) => {
  user.passwordReset = {
    tokenHash: "",
    expiresAt: null,
    usedAt: null,
    requestedAt: null,
  };
};

const register = async (req, res) => {
  const {
    email,
    password,
    name,
    name_first,
    name_last,
    alias,
    phone,
    address = "",
    billingAddress,
    role, // Allow explicit role specification for mobile
    branch, // Branch selection for staff roles
    location, // Location data: { coordinates, address, source }
  } = req.body;

  const normalizedEmail = normalizeEmail(email);
  const errors = {};

  console.log("[Auth][Register] Request received", {
    email: normalizedEmail || "(missing)",
    hasPhone: Boolean(phone),
    requestedRole: role,
    requestedBranch: branch,
  });

  // Validate required fields
  if (!normalizedEmail) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = "Email must be a valid email address";
  }

  if (!name_first || !String(name_first).trim()) {
    errors.name_first = "First name is required";
  } else if (String(name_first).length < 2) {
    errors.name_first = "First name must be at least 2 characters";
  } else if (!/^[a-zA-Z\s]+$/.test(String(name_first))) {
    errors.name_first = "First name can only contain letters";
  }

  if (!name_last || !String(name_last).trim()) {
    errors.name_last = "Last name is required";
  } else if (String(name_last).length < 2) {
    errors.name_last = "Last name must be at least 2 characters";
  } else if (!/^[a-zA-Z\s]+$/.test(String(name_last))) {
    errors.name_last = "Last name can only contain letters";
  }

  if (!phone) {
    errors.phone = "Phone number is required";
  } else if (!isValidPhMobile(phone)) {
    errors.phone = "Phone number must be a valid Philippine mobile number (09XXXXXXXXX or 639XXXXXXXXX)";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (!isStrongPassword(password)) {
    errors.password = "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
  }

  if (alias) {
    const normalizedUsername = String(alias).trim().toLowerCase();
    if (normalizedUsername.length < 2 || normalizedUsername.length > 30 || !/^[a-z0-9_.-]+$/.test(normalizedUsername)) {
      errors.alias = "Alias must be 2-30 characters and contain only letters, numbers, dot, underscore, hyphen";
    }
  }

  // Validate location if provided
  if (location) {
    const locationErrors = validateLocationCoordinates(location.coordinates || {});
    if (locationErrors) {
      Object.assign(errors, locationErrors);
    }
  }

  // If validation errors, return them all at once
  if (Object.keys(errors).length > 0) {
    console.warn("[Auth][Register] Validation failed", { email: normalizedEmail, errors });
    return res.status(400).json({ errors });
  }

  const normalizedPhone = canonicalizePhMobile(phone);
  const normalizedUsername = typeof alias === "string" ? alias.trim().toLowerCase() : "";
  // Use explicit role if provided, otherwise detect from email
  const userRole = role && ["customer", "technician", "admin", "superadmin"].includes(role) ? role : detectRoleFromEmail(normalizedEmail);
  const normalizedBillingAddress = normalizeBillingAddress(billingAddress || {});
  const composedBillingAddress = formatBillingAddress(normalizedBillingAddress);
  const normalizedAddress = typeof address === "string" ? address.trim() : "";
  const normalizedLocation = location ? normalizeLocationData(location) : null;

  // Branch handling based on role
  let assignedBranch = "";
  if (userRole === "customer") {
    // Auto-assign branch based on location for customers
    if (isBillingAddressComplete(normalizedBillingAddress)) {
      assignedBranch = resolvePreferredBranch(normalizedBillingAddress);
    } else if (normalizedAddress) {
      // Try to extract location from address string
      assignedBranch = resolvePreferredBranch({ street: normalizedAddress });
    } else {
      assignedBranch = "Bulacan"; // Default fallback
    }
  } else if (["admin", "technician", "superadmin"].includes(userRole)) {
    // Require branch selection for staff roles
    const selectedBranch = typeof branch === "string" ? branch.trim() : "";
    if (!selectedBranch || !BRANCHES.includes(selectedBranch)) {
      return res.status(400).json({ message: "A valid branch must be selected for this role." });
    }
    assignedBranch = selectedBranch;
  }

  if (userRole === "customer" && !isBillingAddressComplete(normalizedBillingAddress) && !normalizedAddress) {
    console.warn("[Auth][Register] Missing customer billing address", { email: normalizedEmail, userRole });
    return res.status(400).json({ message: "Billing address is required for customer accounts." });
  }

  const dupChecks = [{ email: normalizedEmail }, { phone: normalizedPhone }];
  if (normalizedUsername) {
    dupChecks.push({ username: normalizedUsername });
  }
  const existing = await User.findOne({ $or: dupChecks });
  if (existing) {
    console.warn("[Auth][Register] Duplicate account", { email: normalizedEmail, phone: normalizedPhone });
    return res.status(409).json({ message: "Email, phone, or alias already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const defaultAddress = {
    label: "Billing Address",
    type: "home",
    name: name || `${name_first} ${name_last}`.trim(),
    phone: normalizedPhone,
    region: normalizedBillingAddress.region,
    province: normalizedBillingAddress.province,
    city: normalizedBillingAddress.city,
    barangay: normalizedBillingAddress.barangay,
    street: normalizedBillingAddress.street,
    postalCode: "",
    isDefault: true,
  };

  const user = await User.create({
    email: normalizedEmail,
    username: normalizedUsername || undefined,
    passwordHash,
    name: name || `${name_first} ${name_last}`.trim(),
    name_first,
    name_last,
    phone: normalizedPhone,
    address: userRole === "customer" ? (composedBillingAddress || normalizedAddress) : "",
    billingAddress: userRole === "customer" ? normalizedBillingAddress : {},
    addresses: userRole === "customer" ? [defaultAddress] : [],
    role: userRole,
    assignedBranch,
    activeBranch: assignedBranch, // Set active branch to assigned branch initially
    location: normalizedLocation,
  });

  await OtpRequest.deleteMany({
    action: { $in: ["register_email", "register_phone"] },
    $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
  });

  const token = signAccessToken({ sub: user.id, role: user.role });
  console.log("[Auth][Register] User created", {
    id: user.id,
    email: user.email,
    role: user.role,
    assignedBranch,
    hasAddress: Boolean(user.address),
  });
  return res.status(201).json({ token, user: user.toJSON() });
};

const login = async (req, res) => {
  const { identifier, email, password, branch } = req.body;
  const loginValue = String(identifier || email || "").trim();
  const normalizedLoginValue = normalizeIdentifier(loginValue);
  const errors = {};

  if (!loginValue) {
    errors.email = "Email or alias is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginValue) && loginValue.length < 2) {
    errors.email = "Email or alias must be valid";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const clientType = String(req.body?.clientType || "web").trim().toLowerCase();
  console.log("[Auth][Login] Attempt", {
    identifier: normalizedLoginValue || "(missing)",
    clientType,
    branch: typeof branch === "string" ? branch.trim() : "",
  });

  const user = await findUserByIdentifier(loginValue);
  if (!user) {
    console.warn("[Auth][Login] Failed", {
      identifier: normalizedLoginValue,
      reason: "not_found",
      clientType,
    });
    return res.status(401).json({ errors: { email: "Email or password is incorrect" } });
  }
  if (user.isDeleted || user.accountStatus === "deleted" || user.accountStatus === "disabled") {
    return res.status(403).json({ message: "Account is not active." });
  }

  if (!user.passwordHash) {
    return res.status(400).json({
      message: "This account requires a password. Please reset your password if you've forgotten it.",
    });
  }

  if (!user.role) {
    user.role = detectRoleFromEmail(normalizedLoginValue);
  }
  if (user.role === "technician" && clientType !== "mobile") {
    return res.status(403).json({ message: "Technician accounts cannot access the web platform. Please use the mobile app." });
  }

  if (user.lockoutUntil && user.lockoutUntil.getTime() > Date.now()) {
    const secondsLeft = Math.max(1, Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 1000));
    console.warn("[Auth][Login] Locked", {
      id: user.id,
      role: user.role,
      secondsLeft,
      clientType,
    });
    return res.status(423).json({
      message: `Account locked. Try again in ${secondsLeft} seconds.`,
      secondsLeft,
    });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    const lockSeconds = lockoutSecondsForAttemptCount(user.failedLoginAttempts);
    if (lockSeconds > 0) {
      user.lockoutUntil = new Date(Date.now() + lockSeconds * 1000);
    }
    await user.save();
    if (lockSeconds > 0) {
      console.warn("[Auth][Login] Failed", {
        id: user.id,
        role: user.role,
        reason: "locked",
        attempts: user.failedLoginAttempts,
        clientType,
      });
      return res.status(423).json({
        message: `Account locked. Try again in ${lockSeconds} seconds.`,
        secondsLeft: lockSeconds,
        attempts: user.failedLoginAttempts,
      });
    }
    console.warn("[Auth][Login] Failed", {
      id: user.id,
      role: user.role,
      reason: "invalid_password",
      attempts: user.failedLoginAttempts,
      clientType,
    });
    return res.status(401).json({ errors: { password: "Email or password is incorrect" } });
  }

  // Superadmin doesn't require a branch - they have access to all branches
  const isBranchScopedRole = ["admin", "technician"].includes(user.role);
  let selectedBranch = "";
  let effectiveBranch = "";

  if (isBranchScopedRole) {
    selectedBranch = typeof branch === "string" ? branch.trim() : "";
    effectiveBranch = BRANCHES.includes(selectedBranch)
      ? selectedBranch
      : (BRANCHES.includes(user.activeBranch) ? user.activeBranch : user.assignedBranch);
  }

  // Auto-log attendance for admin and technician users
  if (["admin", "technician"].includes(user.role)) {
    try {
      const Attendance = require("../models/Attendance");
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");
      const day = `${y}-${m}-${d}`;
      const status = "present";
      const branchToUse = effectiveBranch || user.activeBranch || user.assignedBranch || "";
      await Attendance.findOneAndUpdate(
        { user: user._id, day },
        {
          $set: {
            role: user.role,
            status,
            branch: branchToUse,
            notes: "",
          },
        },
        { new: true, upsert: true }
      );
    } catch (err) {
      console.error("[Auth][Login] Failed to auto-log attendance", err);
    }

    if (!effectiveBranch || !BRANCHES.includes(effectiveBranch)) {
      return res.status(400).json({ message: "A valid branch is required for this account." });
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

  return res.json({
    success: true,
    token,
    user: user.toJSON(),
  });
};

const requestOtp = async (req, res) => {
  const action = String(req.body?.action || "").trim();
  const email = normalizeEmail(req.body?.email);
  const phone = canonicalizePhMobile(req.body?.phone);
  const channel = String(req.body?.channel || (action === "register_phone" ? "sms" : "email")).trim();

  if (!action || !["register_email", "register_phone", "password_reset"].includes(action)) {
    return res.status(400).json({ message: "Invalid OTP request action." });
  }

  if (action === "register_email" && !email) {
    return res.status(400).json({ message: "Email is required to request registration OTP." });
  }

  if (action === "register_phone" && !phone) {
    return res.status(400).json({ message: "Phone number is required to request registration OTP." });
  }

  if (action === "password_reset" && !email) {
    return res.status(400).json({ message: "Email is required to request password reset OTP." });
  }

  if (action === "register_email") {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
  }

  if (action === "register_phone") {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this mobile number already exists." });
    }
  }

  if (action === "password_reset") {
    const user = await User.findOne({ email });
    if (!user || user.isDeleted || user.accountStatus !== "active") {
      return res.json({ message: "If this email is registered, a reset code has been sent." });
    }
  }

  await createOtpRequest({ email, phone, action, channel });
  return res.json({ message: "One-time code sent.", action });
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
    return res.status(400).json({ message: "Verification action and code are required." });
  }

  if (!isValidSixDigitCode(code)) {
    return res.status(400).json({ message: "Invalid verification code format." });
  }

  const verification = await verifyOtpRequest({ email, phone, action, channel, code });
  if (!verification.ok) {
    if (verification.reason === "expired") {
      return res.status(410).json({ message: "This code has expired." });
    }
    return res.status(400).json({ message: "Invalid verification code." });
  }

  if (action === "register_email" || action === "register_phone") {
    return res.json({ message: "Verification successful." });
  }

  if (action === "login") {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "No account found for this email." });
    }
    if (user.isDeleted || user.accountStatus === "deleted" || user.accountStatus === "disabled") {
      return res.status(403).json({ message: "Account is not active." });
    }
    if (user.role === "technician") {
      return res.status(403).json({ message: "Technician accounts cannot access the web platform. Please use the mobile app." });
    }
    if (!user.passwordHash) {
      return res.status(400).json({ message: "This account uses Google Sign-In. Please continue with Google." });
    }

    let effectiveBranch = branch || verification.otp.metadata?.branch || "";
    if (user.role === "admin") {
      effectiveBranch = BRANCHES.includes(effectiveBranch) ? effectiveBranch : user.assignedBranch;
      if (!effectiveBranch || !BRANCHES.includes(effectiveBranch)) {
        return res.status(400).json({ message: "A valid branch is required for this account." });
      }
      user.activeBranch = effectiveBranch;
      if (!user.assignedBranch) {
        user.assignedBranch = effectiveBranch;
      }
    } else if (user.role === "superadmin") {
      user.activeBranch = "";
    }

    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    user.lastLogin = new Date();
    await user.save();

    const token = signAccessToken({ sub: user.id, role: user.role });
    return res.json({ token, user: user.toJSON() });
  }

  if (action === "password_reset") {
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required." });
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No account found for this email." });
    }
    if (user.isDeleted || user.accountStatus === "deleted" || user.accountStatus === "disabled") {
      return res.status(403).json({ message: "Account is not active." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.authProvider = user.googleId ? "google" : "local";
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    user.lastLogin = new Date();
    await user.save();

    const token = signAccessToken({ sub: user.id, role: user.role });
    return res.json({ message: "Password reset successful.", token, user: user.toJSON() });
  }

  return res.status(400).json({ message: "Unsupported verification action." });
};

const logout = async (_req, res) => {
  return res.json({ success: true });
};

const me = async (req, res) => {
  return res.json({ user: req.authUser.toJSON() });
};

const requestPasswordReset = async (req, res) => {
  const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    return res.status(400).json({ message: "Email is required." });
  }

  if (!canSendEmail()) {
    return res.status(500).json({ message: "Email service is not configured." });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.json({ message: "If this email is registered, a reset link has been sent." });
  }
  if (user.isDeleted || user.accountStatus === "deleted" || user.accountStatus === "disabled") {
    return res.json({ message: "If this email is registered, a reset link has been sent." });
  }

  const { token, tokenHash } = generatePasswordResetToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + PASSWORD_RESET_MINUTES * 60 * 1000);

  user.passwordReset = {
    tokenHash,
    expiresAt,
    usedAt: null,
    requestedAt: now,
  };
  await user.save();

  const encodedToken = encodeURIComponent(token);
  const resetUrl = `${env.frontendUrl}/reset-password/${encodedToken}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your AeroPulse password",
    text: [
      "We received a request to reset your AeroPulse password.",
      `Use this secure link to reset your password (valid for ${PASSWORD_RESET_MINUTES} minutes):`,
      resetUrl,
      "If you did not request this, you can ignore this email.",
    ].join("\n\n"),
    html: `
      <p>We received a request to reset your AeroPulse password.</p>
      <p>Use this secure link to reset your password (valid for ${PASSWORD_RESET_MINUTES} minutes):</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });

  return res.json({ message: "Reset link sent. Please check your email." });
};

const resetPassword = async (req, res) => {
  const token = decodeURIComponent(String(req.params?.token || "")).trim();
  const newPassword = String(req.body?.password || "");

  if (!token) {
    return res.status(400).json({ message: "Reset token is required." });
  }
  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  const parsed = parseAndVerifyPasswordResetToken(token);
  if (!parsed.ok) {
    return res.status(400).json({ message: "Invalid reset token." });
  }

  const user = await User.findOne({ "passwordReset.tokenHash": parsed.tokenHash });
  if (!user) {
    return res.status(400).json({ message: "Invalid reset token." });
  }

  if (user.passwordReset?.usedAt) {
    return res.status(410).json({ message: "This reset link has already been used." });
  }

  if (!user.passwordReset?.expiresAt || user.passwordReset.expiresAt.getTime() < Date.now()) {
    return res.status(410).json({ message: "This reset link has expired." });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.authProvider = user.googleId ? "google" : "local";
  user.failedLoginAttempts = 0;
  user.lockoutUntil = null;
  user.lastLogin = new Date();
  user.passwordReset.usedAt = new Date();
  user.passwordReset.tokenHash = "";
  user.passwordReset.expiresAt = null;
  await user.save();

  const appToken = signAccessToken({ sub: user.id, role: user.role });
  return res.json({
    message: "Password reset successful.",
    token: appToken,
    user: user.toJSON(),
  });
};

const resetPasswordWithCode = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const code = String(req.body?.code || "").trim();
  const newPassword = String(req.body?.new_password || "").trim();

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: "Email, code and new password are required." });
  }
  if (!isValidSixDigitCode(code)) {
    return res.status(400).json({ message: "Invalid verification code format." });
  }
  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  const verification = await verifyOtpRequest({ email, action: "password_reset", channel: "email", code });
  if (!verification.ok) {
    if (verification.reason === "expired") {
      return res.status(410).json({ message: "This reset code has expired." });
    }
    return res.status(400).json({ message: "Invalid verification code." });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "No account found for this email." });
  }
  if (user.isDeleted || user.accountStatus === "deleted" || user.accountStatus === "disabled") {
    return res.status(403).json({ message: "Account is not active." });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.authProvider = user.googleId ? "google" : "local";
  user.failedLoginAttempts = 0;
  user.lockoutUntil = null;
  user.lastLogin = new Date();
  await user.save();

  const appToken = signAccessToken({ sub: user.id, role: user.role });
  return res.json({
    message: "Password reset successful.",
    token: appToken,
    user: user.toJSON(),
  });
};

module.exports = {
  register,
  login,
  logout,
  me,
  requestPasswordReset,
  resetPassword,
  requestOtp,
  verifyOtp,
  resetPasswordWithCode,
};
