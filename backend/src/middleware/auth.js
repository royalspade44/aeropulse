const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const { BRANCHES } = require("../domain/branchRouting");

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }
    if (user.isDeleted || user.accountStatus === "deleted" || user.accountStatus === "disabled") {
      return res.status(403).json({ message: "Account is not active." });
    }

    req.authUser = user;
    const headerBranch = typeof req.headers["x-branch"] === "string" ? req.headers["x-branch"].trim() : "";
    const isBranchScopedRole = user.role === "admin" || user.role === "technician";
    req.activeBranch = "";
    if (isBranchScopedRole) {
      const effectiveBranch = BRANCHES.includes(headerBranch)
        ? headerBranch
        : (BRANCHES.includes(user.activeBranch) ? user.activeBranch : user.assignedBranch);
      if (!effectiveBranch || !BRANCHES.includes(effectiveBranch)) {
        return res.status(400).json({ message: "Branch is required for this account." });
      }
      req.activeBranch = effectiveBranch;
    }
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const allowRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!allowedRoles.includes(req.authUser.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
};

module.exports = { requireAuth, allowRoles };
