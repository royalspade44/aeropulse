// utils/userHelpers.jsx
import { normalizeEmail } from "./authValidation";

export function isGooglePhoto(value) {
  return typeof value === "string" && value.includes("googleusercontent.com");
}

export function deriveRoleFlags(user = {}) {
  const isTechnician = user.role === "technician" || user.isTechnician === true;

  const role = isTechnician ? "technician" : "customer";

  return {
    role,
    isTechnician: role === "technician",
  };
}

export function buildFullName(user = {}) {
  if (user.name && String(user.name).trim()) {
    return String(user.name).trim();
  }

  return [user.name_first, user.name_last].filter(Boolean).join(" ").trim();
}

export function sanitizeUser(user = {}) {
  const roleFlags = deriveRoleFlags(user);

  return {
    id: user.id || `${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    name_first: user.name_first || "",
    name_last: user.name_last || "",
    name: buildFullName(user),
    email: normalizeEmail(user.email),
    phone: user.phone || "",
    password: user.password || "",
    profilePhoto: user.profilePhoto || null,
    isGoogleAccount: Boolean(
      user.isGoogleAccount || isGooglePhoto(user.profilePhoto),
    ),
    status: user.status || "active",
    createdAt: user.createdAt || new Date().toISOString(),
    ...roleFlags,
    ...user,
    email: normalizeEmail(user.email),
    ...roleFlags,
  };
}

export function findUserByIdentifier(users = [], identifier) {
  if (identifier === undefined || identifier === null) return null;

  const normalized =
    typeof identifier === "string" ? normalizeEmail(identifier) : identifier;

  return (
    users.find((user) => {
      const sameId = String(user.id) === String(identifier);
      const sameEmail =
        typeof normalized === "string" &&
        normalizeEmail(user.email) === normalized;

      return sameId || sameEmail;
    }) || null
  );
}
