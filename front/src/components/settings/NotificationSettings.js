import { useEffect, useMemo, useState } from 'react';
import icons from '../common/icons';

function NotificationSettings({ user, onUpdateNotifications, onUpdateSettings }) {
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
    sms: false,
    accountUpdates: true,
    orderUpdates: true,
    systemAlerts: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const source = user?.notifications || {};
    setNotifications({
      email: source.email !== false,
      inApp: source.inApp !== false && source.push !== false,
      sms: source.sms || false,
      accountUpdates: source.accountUpdates !== false,
      orderUpdates: source.orderUpdates !== false,
      systemAlerts: source.systemAlerts !== false,
    });
  }, [user]);

  const role = String(user?.role || 'customer').toLowerCase();
  const showOrderNotifications = role === 'customer';
  const showSystemAlerts = role === 'admin' || role === 'technician' || role === 'superadmin';

  const rows = useMemo(() => {
    const all = [
      { key: 'email', label: 'Email Notifications', description: 'Receive updates through email.' },
      { key: 'inApp', label: 'In-app Notifications', description: 'Show account notifications inside the app.' },
      { key: 'sms', label: 'SMS Notifications', description: 'Receive critical updates via SMS.' },
      { key: 'accountUpdates', label: 'Account Updates', description: 'Security and account-related updates.' },
      { key: 'orderUpdates', label: 'Order / Transaction Updates', description: 'Order stage changes and transaction updates.', visible: showOrderNotifications },
      { key: 'systemAlerts', label: 'System Alerts', description: 'Operational and branch-level alerts.', visible: showSystemAlerts },
    ];
    return all.filter((item) => item.visible !== false);
  }, [showOrderNotifications, showSystemAlerts]);

  const toggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...notifications,
        push: notifications.inApp,
      };
      if (onUpdateSettings) {
        await onUpdateSettings({ notifications: payload });
      } else {
        await onUpdateNotifications(payload);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-section">
      <div className="section-title">
        <span className="section-icon"><img src={icons.visit} alt="" className="inline-icon inline-icon--md" /></span>
        <h2>Notification Settings</h2>
      </div>
      <div className="settings-list">
        {rows.map((row) => (
          <div className="setting-item" key={row.key}>
            <div className="setting-info">
              <div className="setting-label">{row.label}</div>
              <div className="setting-description">{row.description}</div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={Boolean(notifications[row.key])} onChange={() => toggle(row.key)} />
              <span className="toggle-slider" />
            </label>
          </div>
        ))}

        <div className="setting-item">
          <button type="button" className="modal-btn modal-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Notification Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationSettings;
