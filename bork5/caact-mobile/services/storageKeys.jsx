// services/storageKeys.js
// Canonical AsyncStorage key names used across the app.
// These must match the keys used in authStorage.jsx and UserContext.

export const STORAGE_KEYS = {
  // Auth
  USERS: "auth_users",
  CURRENT_USER: "auth_current_user",
  LOGIN_ATTEMPTS: "auth_login_attempts",
  AUDIT_LOGS: "auth_audit_logs",

  // Data
  CART: "cart",
  ORDERS: "orders_storage_v1",
  PRODUCTS: "product_catalog_v3",
  BOOKINGS: "serviceBookings",
  UNITS: "units_storage_v1",
  SERVICE_REQUESTS: "service_requests_storage_v2",
  TASKS: "technician_tasks_storage_v2",
  INVENTORY: "inventory_storage_v2",
  PARTS_REQUESTS: "parts_requests_storage_v2",
  REORDERS: "reorder_orders_storage_v2",
};
