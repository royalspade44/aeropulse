// services/api.jsx
// HTTP client for the Quart API server.
//
// Base URL selection:
//   - Android emulator  →  http://10.0.2.2:5050
//   - iOS simulator / web / Expo Go on same machine → http://localhost:5050
//   - Real device on LAN → change to your machine's local IP, e.g. http://192.168.1.x:5050
//
// Change API_BASE here to match your environment.

import { API_BASE } from "../constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function request(method, path, { token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  return { status: res.status, ok: res.ok, data };
}

const get = (path, token) => request("GET", path, { token });
const post = (path, body, token) => request("POST", path, { token, body });
const patch = (path, body, token) => request("PATCH", path, { token, body });
const del = (path, token) => request("DELETE", path, { token });
const TOKEN_KEY = "auth_token";

export async function getStoredToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/**
 * Login with email + password.
 * Returns { success, token, user } on success.
 * Returns { success: false, error, locked?, secondsLeft? } on failure.
 */
export async function login(identifier, password) {
  const { ok, data } = await post("/auth/login", {
    identifier,
    email: identifier,
    password,
    clientType: "mobile",
  });

  if (ok && data?.token && data?.user) {
    return { success: true, token: data.token, user: data.user };
  }

  if (ok && data?.otpRequired) {
    return {
      success: false,
      error:
        data.message ||
        "A one-time code is required. Mobile login currently expects direct session login.",
    };
  }

  return {
    success: false,
    error: data.error || data.message || "Login failed.",
    locked: data.locked || false,
    secondsLeft: data.seconds_left || 0,
  };
}

/**
 * Register a new account (customer or technician).
 * Returns { success, token, user } on success.
 */
export async function register({
  name_first,
  name_last,
  suffix,
  alias,
  email,
  phone,
  password,
  address,
  municipality,
  municipality_code,
  submunicipality,
  submunicipality_code,
  thoroughfare,
  property_block_lot,
  apartment_unit,
  landmark,
  plus_code,
  contact_method,
  messenger_handle,
  delivery_instructions,
  role, // Add role parameter for technician registration
}) {
  const { ok, status, data } = await post("/auth/register", {
    name_first,
    name_last,
    suffix,
    alias,
    email,
    phone,
    password,
    address,
    municipality,
    municipality_code,
    submunicipality,
    submunicipality_code,
    thoroughfare,
    property_block_lot,
    apartment_unit,
    landmark,
    plus_code,
    contact_method,
    messenger_handle,
    delivery_instructions,
    role, // Include role in the request
  });
  if (ok) return { success: true, token: data.token, user: data.user };
  return {
    success: false,
    error:
      data.error ||
      (status === 409
        ? "That email or alias is already in use."
        : "Registration failed."),
  };
}

/**
 * Logout — invalidates the server session token.
 */
export async function logout(token) {
  if (!token) return;
  await post("/auth/logout", {}, token);
}

/**
 * Fetch the current user from a stored token.
 * Returns { success, user } or { success: false }.
 */
export async function me(token) {
  if (!token) return { success: false };
  const { ok, data } = await get("/auth/me", token);
  if (ok) return { success: true, user: data.user };
  return { success: false };
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

export async function forgotPassword(email, role = "customer") {
  const { ok, data } = await post("/auth/forgot-password", { email, role });
  if (ok) return { success: true, message: data.message };
  return { success: false, error: data.error || "Request failed." };
}

export async function requestOtp(email, phone, action = "register_phone", channel = "sms") {
  const { ok, data } = await post("/auth/request-otp", {
    email,
    phone,
    action,
    channel,
  });
  if (ok) return { success: true, message: data.message };
  return { success: false, error: data.error || "Failed to request OTP." };
}

export async function verifyOtp(email, phone, code, action = "register_phone", channel = "sms") {
  const { ok, data } = await post("/auth/verify-otp", {
    email,
    phone,
    code,
    action,
    channel,
  });
  if (ok) return { success: true };
  return { success: false, error: data.error || "Invalid OTP." };
}

export async function resetPassword(email, code, newPassword) {
  const { ok, data } = await post("/auth/reset-password", {
    email,
    code,
    new_password: newPassword,
  });
  if (ok) return { success: true };
  return { success: false, error: data.error || "Reset failed." };
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

/**
 * Fetch all users. Requires authentication token.
 */
export async function fetchUsers(token) {
  const { ok, data } = await get("/users", token);
  if (ok) return { success: true, users: data.users || [] };
  return {
    success: false,
    error: data.error || "Failed to fetch users.",
    users: [],
  };
}

/**
 * Create a new user (technician or customer).
 */
export async function createUser(token, payload) {
  const { ok, status, data } = await post("/users", payload, token);
  if (ok) return { success: true, user: data.user };
  return {
    success: false,
    error:
      status === 409
        ? "An account with this email already exists."
        : data.error || "Failed to create user.",
  };
}

/**
 * Update a user's fields.
 */
export async function updateUser(token, userId, payload) {
  const { ok, data } = await patch(`/users/${userId}`, payload, token);
  if (ok) return { success: true, user: data.user };
  return { success: false, error: data.error || "Update failed." };
}

/**
 * Toggle a user's status (active ↔ disabled).
 */
export async function toggleStatus(token, userId, status) {
  const { ok, data } = await patch(
    `/users/${userId}/status`,
    { status },
    token,
  );
  if (ok) return { success: true, user: data.user };
  return { success: false, error: data.error || "Status update failed." };
}

/**
 * Delete a user.
 */
export async function deleteUser(token, userId) {
  const { ok, data } = await del(`/users/${userId}`, token);
  if (ok) return { success: true };
  return { success: false, error: data.error || "Delete failed." };
}

// ---------------------------------------------------------------------------
// Profile (self-service)
// ---------------------------------------------------------------------------

/**
 * Update the current user's own profile.
 */
export async function updateProfile(token, payload) {
  const { ok, data } = await patch("/users/profile", payload, token);
  if (ok) return { success: true, user: data.user };
  return { success: false, error: data.error || "Profile update failed." };
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

function normalizeBackendOrder(order = {}) {
  const workflow = String(order.workflowStatus || "").toLowerCase();
  const status = String(order.status || "").toLowerCase();

  const deliveryStatus = (() => {
    if (workflow === "complete") return "DELIVERED";
    if (workflow === "to_deliver") return "OUT_FOR_DELIVERY";
    if (workflow === "cancelled") return "CANCELLED";
    return "NOT_STARTED";
  })();

  const paymentStatus = (() => {
    if (status === "paid") return "VERIFIED";
    if (status === "cancelled") return "FAILED";
    return "PENDING_VERIFICATION";
  })();

  return {
    id: order.id || order._id || "",
    items: Array.isArray(order.items) ? order.items : [],
    status: workflow || status || "pending",
    deliveryStatus,
    paymentStatus,
    serviceRequestId: order.serviceRequestId || "",
    total: Number(order.totalAmount || order.total || 0),
    createdAt: order.createdAt || "",
    updatedAt: order.updatedAt || order.createdAt || "",
  };
}

export async function fetchMyOrders(token) {
  const { ok, data } = await get("/orders/me", token);
  if (ok) {
    const orders = Array.isArray(data.orders)
      ? data.orders.map(normalizeBackendOrder)
      : [];
    return { success: true, orders };
  }
  return {
    success: false,
    error: data.error || "Failed to fetch orders.",
    orders: [],
  };
}

// ---------------------------------------------------------------------------
// Service requests
// ---------------------------------------------------------------------------

function normalizeBackendServiceRequest(item = {}) {
  return {
    ...item,
    id: item.id || item._id || "",
    status: item.status || "Submitted",
    createdAt: item.createdAt || "",
    updatedAt: item.updatedAt || item.createdAt || "",
  };
}

export async function fetchMyServiceRequests(token) {
  const { ok, data } = await get("/service-requests/me", token);
  if (ok) {
    const requests = Array.isArray(data.requests)
      ? data.requests.map(normalizeBackendServiceRequest)
      : [];
    return { success: true, requests };
  }
  return { success: false, error: data.error || "Failed to fetch requests.", requests: [] };
}

export async function createServiceRequest(token, payload) {
  const { ok, data } = await post("/service-requests/me", payload, token);
  if (ok) return { success: true, request: normalizeBackendServiceRequest(data.request) };
  return { success: false, error: data.error || "Failed to create request." };
}

export async function updateServiceRequestStatus(token, requestId, status, payload = {}) {
  const { ok, data } = await patch(
    `/service-requests/${encodeURIComponent(requestId)}/status`,
    { status, ...payload },
    token,
  );
  if (ok) return { success: true, request: normalizeBackendServiceRequest(data.request) };
  return { success: false, error: data.error || "Failed to update request." };
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

function normalizeBackendNotification(item = {}) {
  return {
    ...item,
    id: item.id || item._id || "",
    read: item.unread === false || item.status === "read",
  };
}

export async function fetchMyNotifications(token) {
  const { ok, data } = await get("/notifications/me", token);
  if (ok) {
    const notifications = Array.isArray(data.notifications)
      ? data.notifications.map(normalizeBackendNotification)
      : [];
    return { success: true, notifications };
  }
  return { success: false, error: data.error || "Failed to fetch notifications.", notifications: [] };
}

export async function markNotificationRead(token, notificationId) {
  const { ok, data } = await patch(`/notifications/${encodeURIComponent(notificationId)}/read`, {}, token);
  if (ok) return { success: true, notification: normalizeBackendNotification(data.notification) };
  return { success: false, error: data.error || "Failed to update notification." };
}

export async function markAllNotificationsRead(token) {
  const { ok, data } = await patch("/notifications/me/read-all", {}, token);
  if (ok) return { success: true, message: data.message };
  return { success: false, error: data.error || "Failed to update notifications." };
}

// ---------------------------------------------------------------------------
// Audit logs
// ---------------------------------------------------------------------------

/**
 * Fetch all audit logs.
 */
export async function fetchAuditLogs(token) {
  const { ok, data } = await get("/audit-logs", token);
  if (ok) return { success: true, logs: data.logs || [] };
  return {
    success: false,
    error: data.error || "Failed to fetch logs.",
    logs: [],
  };
}

/**
 * Write an audit log entry.
 */
export async function createAuditLog(token, { action, target_id, details }) {
  const { ok, data } = await post(
    "/audit-logs",
    { action, target_id, details },
    token,
  );
  if (ok) return { success: true, id: data.id };
  return { success: false, error: data.error || "Failed to log action." };
}

// ---------------------------------------------------------------------------
// Technician tasks
// ---------------------------------------------------------------------------

export async function fetchTasks(token, { technicianId } = {}) {
  const query = technicianId ? `?technician_id=${encodeURIComponent(technicianId)}` : "";
  const { ok, data } = await get(`/tasks${query}`, token);
  if (ok) return { success: true, tasks: data.tasks || [] };
  return { success: false, error: data.error || "Failed to fetch tasks.", tasks: [] };
}

export async function fetchTask(token, taskId) {
  const { ok, data } = await get(`/tasks/${encodeURIComponent(taskId)}`, token);
  if (ok) return { success: true, task: data.task };
  return { success: false, error: data.error || "Failed to fetch task." };
}

export async function createTask(token, payload) {
  const { ok, data } = await post("/tasks", payload, token);
  if (ok) return { success: true, task: data.task };
  return { success: false, error: data.error || "Failed to create task." };
}

export async function patchTask(token, taskId, payload) {
  const { ok, data } = await patch(`/tasks/${encodeURIComponent(taskId)}`, payload, token);
  if (ok) return { success: true, task: data.task };
  return { success: false, error: data.error || "Failed to update task." };
}

// ---------------------------------------------------------------------------
// Security and recovery
// ---------------------------------------------------------------------------

export async function fetchRecoveryCodes(token) {
  const { ok, data } = await get("/security/recovery-codes", token);
  if (ok) return { success: true, codes: data.codes || [] };
  return { success: false, error: data.error || "Failed to fetch recovery codes." };
}

export async function regenerateRecoveryCodes(token) {
  const { ok, data } = await post("/security/recovery-codes/regenerate", {}, token);
  if (ok) return { success: true, codes: data.codes || [] };
  return { success: false, error: data.error || "Failed to regenerate recovery codes." };
}

export async function consumeRecoveryCode(identifier, code) {
  const { ok, data } = await post("/security/recovery-codes/consume", {
    identifier,
    email: identifier,
    code,
  });
  if (ok) return { success: true };
  return { success: false, error: data.error || "Invalid recovery code." };
}

export async function fetchTotpSecret(token) {
  const { ok, data } = await get("/security/totp-secret", token);
  if (ok) return { success: true, secret: data.secret || "" };
  return { success: false, error: data.error || "Failed to fetch TOTP secret." };
}

export async function regenerateTotpSecret(token) {
  const { ok, data } = await post("/security/totp-secret/regenerate", {}, token);
  if (ok) return { success: true, secret: data.secret || "" };
  return { success: false, error: data.error || "Failed to regenerate TOTP secret." };
}
