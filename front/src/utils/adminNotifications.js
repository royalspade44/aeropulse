const ADMIN_NOTIFICATIONS_READ_AT_KEY = 'aeropulse_admin_notifications_read_at';

export const getAdminNotificationsReadAt = () => {
  const raw = localStorage.getItem(ADMIN_NOTIFICATIONS_READ_AT_KEY);
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const markAllAdminNotificationsRead = () => {
  const now = Date.now();
  localStorage.setItem(ADMIN_NOTIFICATIONS_READ_AT_KEY, String(now));
  return now;
};

