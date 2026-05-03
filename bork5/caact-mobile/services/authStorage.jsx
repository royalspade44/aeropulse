// services/authStorage.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  USERS: "auth_users",
  CURRENT_USER: "auth_current_user",
  LOGIN_ATTEMPTS: "auth_login_attempts",
  AUDIT_LOGS: "auth_audit_logs",
};

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

export async function loadUsers() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
  const parsed = safeParse(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

export async function saveUsers(users = []) {
  await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return users;
}

export async function loadCurrentUser() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return safeParse(raw, null);
}

export async function saveCurrentUser(user = null) {
  if (!user) {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return null;
  }
  await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  return user;
}

export async function clearCurrentUser() {
  await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export async function loadLoginAttempts() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.LOGIN_ATTEMPTS);
  return safeParse(raw, {});
}

export async function saveLoginAttempts(attempts = {}) {
  await AsyncStorage.setItem(STORAGE_KEYS.LOGIN_ATTEMPTS, JSON.stringify(attempts));
  return attempts;
}

export async function loadAuditLogsFromStorage() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  const parsed = safeParse(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

export async function saveAuditLogsToStorage(logs = []) {
  await AsyncStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  return logs;
}