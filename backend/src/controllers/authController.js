const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signAccessToken } = require("../utils/token");
const env = require("../config/env");

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
    role = "customer",
  } = req.body;
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!normalizedEmail || !password || !name_first || !name_last || !phone) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { phone }] });
  if (existing) {
    return res.status(409).json({ message: "Email or phone already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: normalizedEmail,
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

  if (role && user.role !== role) {
    return res.status(403).json({ message: `Access denied. This account is not registered as a ${role}.` });
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

  const role = req.query.role || "customer";
  const state = Buffer.from(JSON.stringify({ role }), "utf8").toString("base64url");
  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: env.googleRedirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state,
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

    const parsedState = state
      ? JSON.parse(Buffer.from(state, "base64url").toString("utf8"))
      : { role: "customer" };

    let user = await User.findOne({ email });
    if (!user) {
      const [firstName = "Google", ...rest] = (profile.name || "Google User").split(" ");
      user = await User.create({
        email,
        name: profile.name || "Google User",
        name_first: profile.given_name || firstName,
        name_last: profile.family_name || rest.join(" ") || "User",
        role: parsedState.role || "customer",
        authProvider: "google",
        googleId: profile.sub,
        avatarUrl: profile.picture || "",
      });
    } else {
      user.authProvider = "google";
      user.googleId = profile.sub || user.googleId;
      user.avatarUrl = profile.picture || user.avatarUrl;
      if (parsedState?.role && user.role !== parsedState.role) {
        user.role = parsedState.role;
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
