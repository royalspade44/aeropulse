import AsyncStorage from "@react-native-async-storage/async-storage";
import * as api from "./api";

const RECOVERY_CODES_KEY = "customer_recovery_codes_v1";
const TOTP_SECRETS_KEY = "customer_totp_secrets_v1";

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function randomCode(length = 12) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";

  for (let index = 0; index < length; index += 1) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return result;
}

function generateRecoveryCodes() {
  return Array.from({ length: 6 }, () => ({
    code: randomCode(12),
    used: false,
  }));
}

function generateTotpSecret() {
  return randomCode(16);
}

async function loadMap(storageKey) {
  const raw = await AsyncStorage.getItem(storageKey);
  return safeParse(raw, {});
}

async function saveMap(storageKey, value) {
  await AsyncStorage.setItem(storageKey, JSON.stringify(value));
  return value;
}

export async function ensureRecoveryCodes(userId) {
  if (!userId) return [];
  try {
    const token = await api.getStoredToken();
    if (token) {
      const result = await api.fetchRecoveryCodes(token);
      if (result.success) return result.codes;
    }
  } catch {}

  const map = await loadMap(RECOVERY_CODES_KEY);

  if (!Array.isArray(map[userId]) || map[userId].length !== 6) {
    map[userId] = generateRecoveryCodes();
    await saveMap(RECOVERY_CODES_KEY, map);
  }

  return map[userId];
}

export async function regenerateRecoveryCodes(userId) {
  if (!userId) return [];
  try {
    const token = await api.getStoredToken();
    if (token) {
      const result = await api.regenerateRecoveryCodes(token);
      if (result.success) return result.codes;
    }
  } catch {}

  const map = await loadMap(RECOVERY_CODES_KEY);
  map[userId] = generateRecoveryCodes();
  await saveMap(RECOVERY_CODES_KEY, map);
  return map[userId];
}

export async function consumeRecoveryCode(userId, code) {
  if (!userId || !code) return { success: false };
  try {
    const result = await api.consumeRecoveryCode(userId, code);
    if (result.success) return { success: true, code };
  } catch {}

  const map = await loadMap(RECOVERY_CODES_KEY);
  const codes = Array.isArray(map[userId]) ? map[userId] : [];
  const next = codes.map((entry) =>
    entry.code === code && !entry.used ? { ...entry, used: true } : entry,
  );
  const matched = codes.find((entry) => entry.code === code && !entry.used);

  if (!matched) {
    return { success: false };
  }

  map[userId] = next;
  await saveMap(RECOVERY_CODES_KEY, map);
  return { success: true, code };
}

export async function ensureCustomerTotpSecret(userId) {
  if (!userId) return "";
  try {
    const token = await api.getStoredToken();
    if (token) {
      const result = await api.fetchTotpSecret(token);
      if (result.success) return result.secret;
    }
  } catch {}

  const map = await loadMap(TOTP_SECRETS_KEY);

  if (!map[userId]) {
    map[userId] = generateTotpSecret();
    await saveMap(TOTP_SECRETS_KEY, map);
  }

  return map[userId];
}

export async function regenerateCustomerTotpSecret(userId) {
  if (!userId) return "";
  try {
    const token = await api.getStoredToken();
    if (token) {
      const result = await api.regenerateTotpSecret(token);
      if (result.success) return result.secret;
    }
  } catch {}

  const map = await loadMap(TOTP_SECRETS_KEY);
  map[userId] = generateTotpSecret();
  await saveMap(TOTP_SECRETS_KEY, map);
  return map[userId];
}
