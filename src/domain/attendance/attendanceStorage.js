const ATTENDANCE_STORAGE_KEY = 'aeropulse_attendance_logs';

const parse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return [];
  }
};

export const loadAttendanceLogs = () => {
  const logs = parse(localStorage.getItem(ATTENDANCE_STORAGE_KEY));
  return Array.isArray(logs) ? logs : [];
};

export const saveAttendanceLogs = (logs) => {
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(logs));
};

export const upsertAttendanceLog = (payload) => {
  const logs = loadAttendanceLogs();
  const id = payload.id || `${payload.staffName}-${payload.date || new Date().toISOString().split('T')[0]}`;
  const now = new Date().toISOString();
  const index = logs.findIndex((log) => log.id === id);
  const nextItem = {
    ...payload,
    id,
    updatedAt: now
  };
  if (index >= 0) {
    logs[index] = { ...logs[index], ...nextItem };
  } else {
    logs.unshift({ ...nextItem, createdAt: now });
  }
  saveAttendanceLogs(logs);
  return nextItem;
};

export const logEarlyOut = ({ id, earlyOutTime, reason, modifiedBy }) => {
  const logs = loadAttendanceLogs();
  const index = logs.findIndex((log) => log.id === id);
  if (index < 0) return null;
  logs[index] = {
    ...logs[index],
    status: 'early-out',
    earlyOutTime,
    earlyOutReason: reason,
    modifiedBy,
    updatedAt: new Date().toISOString()
  };
  saveAttendanceLogs(logs);
  return logs[index];
};
