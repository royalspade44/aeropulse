const STORAGE_KEY = 'aeropulse_admin_audit_logs_v1';

const safeParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch (_e) {
    return [];
  }
};

export const loadAuditLogs = () => {
  const parsed = safeParse(localStorage.getItem(STORAGE_KEY));
  return Array.isArray(parsed) ? parsed : [];
};

export const appendAuditLog = ({ user = '', action = '', details = '' }) => {
  const logs = loadAuditLogs();
  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    user: String(user || ''),
    action: String(action || ''),
    details: String(details || ''),
  };
  logs.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, 2000)));
  return entry;
};

