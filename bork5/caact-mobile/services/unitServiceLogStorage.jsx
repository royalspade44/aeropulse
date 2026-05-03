import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "unit_service_logs_storage_v1";
const DRAFT_KEY = "unit_service_log_draft_v1";

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export const LOG_TYPES = [
  { id: "installation", label: "Installation" },
  { id: "cleaning", label: "Cleaning" },
  { id: "repair", label: "Repair" },
  { id: "checkup", label: "Check-up" },
  { id: "other", label: "Other" },
];

export function normalizeServiceLog(log = {}) {
  const createdAt = log.createdAt || new Date().toISOString();
  return {
    id: log.id || `unit_log_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    taskId: log.taskId || "",
    requestId: log.requestId || "",
    unitId: log.unitId || "",
    unitName: log.unitName || "",
    technicianId: log.technicianId || "",
    technicianName: log.technicianName || "",
    logType: log.logType || "other",
    label: log.label || LOG_TYPES.find((type) => type.id === log.logType)?.label || "Other",
    condition: log.condition || "Good",
    hoursSpent: Number(log.hoursSpent || 0),
    partsUsed: log.partsUsed || "",
    notes: log.notes || "",
    createdAt,
    updatedAt: log.updatedAt || createdAt,
  };
}

export async function getAllServiceLogs() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const parsed = safeParse(raw, []);
  return Array.isArray(parsed) ? parsed.map(normalizeServiceLog) : [];
}

export async function saveAllServiceLogs(logs = []) {
  const normalized = logs.map(normalizeServiceLog);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export async function getServiceLogsByUnit(unitId) {
  const logs = await getAllServiceLogs();
  return logs
    .filter((log) => String(log.unitId || "") === String(unitId || ""))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export async function getServiceLogsByTask(taskId) {
  const logs = await getAllServiceLogs();
  return logs
    .filter((log) => String(log.taskId || "") === String(taskId || ""))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export async function getServiceLogById(logId) {
  const logs = await getAllServiceLogs();
  return logs.find((log) => String(log.id) === String(logId)) || null;
}

export async function upsertServiceLog(log = {}) {
  const logs = await getAllServiceLogs();
  const normalized = normalizeServiceLog({
    ...log,
    updatedAt: new Date().toISOString(),
  });
  const exists = logs.some((item) => String(item.id) === String(normalized.id));
  const next = exists
    ? logs.map((item) => (String(item.id) === String(normalized.id) ? normalized : item))
    : [normalized, ...logs];
  await saveAllServiceLogs(next);
  return normalized;
}

export async function deleteServiceLog(logId) {
  const logs = await getAllServiceLogs();
  await saveAllServiceLogs(logs.filter((log) => String(log.id) !== String(logId)));
  return true;
}

export async function getLogDraft(taskId) {
  const raw = await AsyncStorage.getItem(`${DRAFT_KEY}_${taskId}`);
  return safeParse(raw, null);
}

export async function saveLogDraft(taskId, draft) {
  await AsyncStorage.setItem(`${DRAFT_KEY}_${taskId}`, JSON.stringify(draft || {}));
}

export async function clearLogDraft(taskId) {
  await AsyncStorage.removeItem(`${DRAFT_KEY}_${taskId}`);
}
