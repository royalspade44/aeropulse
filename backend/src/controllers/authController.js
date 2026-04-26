const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signAccessToken } = require("../utils/token");
const env = require("../config/env");
const { BRANCHES } = require("../domain/branchRouting");

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

const normalizeBillingAddress = (payload = {}) => ({
  region: String(payload.region || "").trim(),
  province: String(payload.province || "").trim(),
  city: String(payload.city || "").trim(),
  barangay: String(payload.barangay || "").trim(),
  street: String(payload.street || "").trim(),
});

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
  if (normalizedEmail.includes("admin")) return "admin";
  if (normalizedEmail.includes("tech")) return "technician";
  return "customer";
};

const lockoutSecondsForAttemptCount = (attempts) => {
  if (attempts < 3) return 0;
  const ms = 60_000 + (attempts - 3) * 30_000;
  return Math.ceil(ms / 1000);
};

const register = async (req, res) => {
  const {
    email,
    password,
    name,
    name_first,
    name_last,
    phone,
    address = "",
    billingAddress,
    emailOtp,
    totpCode,
    smsCode,
  } = req.body;
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  console.log("[Auth][Register] Request received", {
    email: normalizedEmail || "(missing)",
    hasPhone: Boolean(phone),
    hasEmailOtp: Boolean(emailOtp),
    hasTotpCode: Boolean(totpCode),
    hasSmsCode: Boolean(smsCode),
  });

  if (!normalizedEmail || !password || !name_first || !name_last || !phone) {
    console.warn("[Auth][Register] Missing required fields", { email: normalizedEmail || "(missing)" });
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (!isValidPhMobile(phone)) {
    console.warn("[Auth][Register] Invalid phone format", { email: normalizedEmail, phone });
    return res.status(400).json({ message: "Invalid phone number format. Use 09XXXXXXXXX." });
  }

  const normalizedPhone = canonicalizePhMobile(phone);
  const detectedRole = detectRoleFromEmail(normalizedEmail);
  const normalizedBillingAddress = normalizeBillingAddress(billingAddress || {});
  const composedBillingAddress = formatBillingAddress(normalizedBillingAddress);
  const normalizedAddress = typeof address === "string" ? address.trim() : "";

  if (!isValidSixDigitCode(emailOtp) || !isValidSixDigitCode(totpCode) || !isValidSixDigitCode(smsCode)) {
    console.warn("[Auth][Register] Invalid code format", { email: normalizedEmail });
    return res.status(400).json({
      message: "Invalid demo code format. Email OTP, authenticator code, and SMS code must be exactly 6 digits.",
    });
  }

  if (detectedRole === "customer" && !isBillingAddressComplete(normalizedBillingAddress) && !normalizedAddress) {
    console.warn("[Auth][Register] Missing customer billing address", { email: normalizedEmail, detectedRole });
    return res.status(400).json({ message: "Billing address is required for customer accounts." });
  }

  const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] });
  if (existing) {
    console.warn("[Auth][Register] Duplicate account", { email: normalizedEmail, phone: normalizedPhone });
    return res.status(409).json({ message: "Email or phone already registered" });
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
    passwordHash,
    name: name || `${name_first} ${name_last}`.trim(),
    name_first,
    name_last,
    phone: normalizedPhone,
    address: detectedRole === "customer" ? (composedBillingAddress || normalizedAddress) : "",
    billingAddress: detectedRole === "customer" ? normalizedBillingAddress : {},
    addresses: detectedRole === "customer" ? [defaultAddress] : [],
    role: detectedRole,
  });

  const token = signAccessToken({ sub: user.id, role: user.role });
  console.log("[Auth][Register] User created", {
    id: user.id,
    email: user.email,
    role: user.role,
    hasAddress: Boolean(user.address),
  });
  return res.status(201).json({ token, user: user.toJSON() });
};

const login = async (req, res) => {
  const { email, password, branch } = req.body;
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ message: "Email not found. Please register first." });
  }

  if (!user.passwordHash) {
    return res.status(400).json({
      message: "This account uses Google Sign-In. Please continue with Google.",
    });
  }

  const detectedRole = detectRoleFromEmail(normalizedEmail);
  if (user.role !== detectedRole) {
    user.role = detectedRole;
  }

  if (user.lockoutUntil && user.lockoutUntil.getTime() > Date.now()) {
    const secondsLeft = Math.max(1, Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 1000));
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
      return res.status(423).json({
        message: `Account locked. Try again in ${lockSeconds} seconds.`,
        secondsLeft: lockSeconds,
        attempts: user.failedLoginAttempts,
      });
    }
    return res.status(401).json({ message: "Incorrect password. Please try again.", attempts: user.failedLoginAttempts });
  }

  const isBranchScopedRole = user.role === "admin" || user.role === "technician";
  if (isBranchScopedRole) {
    const selectedBranch = typeof branch === "string" ? branch.trim() : "";
    const effectiveBranch = BRANCHES.includes(selectedBranch)
      ? selectedBranch
      : (BRANCHES.includes(user.activeBranch) ? user.activeBranch : user.assignedBranch);

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
};

const me = async (req, res) => {
  return res.json({ user: req.authUser.toJSON() });
};

const googleStart = async (req, res) => {
  if (!env.googleClientId || !env.googleClientSecret) {
    return res.status(500).json({ message: "Google OAuth is not configured on server." });
  }

  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: env.googleRedirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};

const googleCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.redirect(`${env.frontendUrl}/login?google_error=missing_code`);
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.googleClientId,
        client_secret: env.googleClientSecret,
        redirect_uri: env.googleRedirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      return res.redirect(`${env.frontendUrl}/login?google_error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileResponse.ok) {
      return res.redirect(`${env.frontendUrl}/login?google_error=profile_fetch_failed`);
    }

    const profile = await profileResponse.json();
    const email = (profile.email || "").toLowerCase();
    if (!email) {
      return res.redirect(`${env.frontendUrl}/login?google_error=missing_email`);
    }

    const detectedRole = detectRoleFromEmail(email);

    let user = await User.findOne({ email });
    if (!user) {
      const [firstName = "Google", ...rest] = (profile.name || "Google User").split(" ");
      user = await User.create({
        email,
        name: profile.name || "Google User",
        name_first: profile.given_name || firstName,
        name_last: profile.family_name || rest.join(" ") || "User",
        role: detectedRole,
        authProvider: "google",
        googleId: profile.sub,
        avatarUrl: profile.picture || "",
      });
    } else {
      user.authProvider = "google";
      user.googleId = profile.sub || user.googleId;
      user.avatarUrl = profile.picture || user.avatarUrl;
      if (user.role !== detectedRole) {
        user.role = detectedRole;
      }
      await user.save();
    }

    const appToken = signAccessToken({ sub: user.id, role: user.role });
    const payload = encodeURIComponent(JSON.stringify(user.toJSON()));
    return res.redirect(`${env.frontendUrl}/auth/google/callback?token=${appToken}&user=${payload}`);
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, login, me, googleStart, googleCallback };
