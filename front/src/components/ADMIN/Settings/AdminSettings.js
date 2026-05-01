import { useMemo, useState } from 'react';
import AdminLayout from '../Common/AdminLayout';
import { useAdminSettings } from '../../../context/AdminSettingsContext';
import { useUser } from '../../../context/UserContext';
import { appendAuditLog } from '../../../utils/auditLogs';
import '../adminShared.css';

function AdminSettings() {
  const { user } = useUser();
  const { settings, saveSettings } = useAdminSettings();
  const [draft, setDraft] = useState(settings);
  const [savedAt, setSavedAt] = useState('');

  const storeName = draft.general.storeName;
  const subtitle = useMemo(() => `Configure general settings, notifications, and roles${storeName ? ` — ${storeName}` : ''}`, [storeName]);

  const onSave = () => {
    saveSettings(draft);
    setSavedAt(new Date().toISOString());
    appendAuditLog({
      user: user?.email || user?.name || 'admin',
      action: 'update_settings',
      details: `Updated settings (storeName=${draft.general.storeName}, lowStockThreshold=${draft.notifications.lowStockThreshold}, adminMode=${draft.roles.adminMode})`,
    });
    alert('Settings saved.');
  };

  return (
    <AdminLayout title="Settings" subtitle={subtitle}>
      <div className="admin-grid-2">
        <div className="admin-card">
          <h3>General</h3>
          <label>
            Store name
            <input
              value={draft.general.storeName}
              onChange={(e) => setDraft((p) => ({ ...p, general: { ...p.general, storeName: e.target.value } }))}
              placeholder="AeroPulse"
            />
          </label>
          <label>
            Address
            <input
              value={draft.general.address}
              onChange={(e) => setDraft((p) => ({ ...p, general: { ...p.general, address: e.target.value } }))}
              placeholder="Store address"
            />
          </label>
          <label>
            Tax rate (%)
            <input
              type="number"
              min="0"
              value={draft.general.taxRate}
              onChange={(e) => setDraft((p) => ({ ...p, general: { ...p.general, taxRate: Number(e.target.value) || 0 } }))}
            />
          </label>
          <label>
            Currency
            <select
              value={draft.general.currency}
              onChange={(e) => setDraft((p) => ({ ...p, general: { ...p.general, currency: e.target.value } }))}
            >
              <option value="PHP">PHP</option>
              <option value="USD">USD</option>
            </select>
          </label>
        </div>

        <div className="admin-card">
          <h3>Notifications</h3>
          <label>
            Low stock threshold
            <input
              type="number"
              min="1"
              value={draft.notifications.lowStockThreshold}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  notifications: { ...p.notifications, lowStockThreshold: Math.max(1, Number(e.target.value) || 5) },
                }))
              }
            />
          </label>

          <h3 style={{ marginTop: 16 }}>Roles</h3>
          <label>
            Admin permissions mode
            <select
              value={draft.roles.adminMode}
              onChange={(e) => setDraft((p) => ({ ...p, roles: { ...p.roles, adminMode: e.target.value } }))}
            >
              <option value="full">Full admin</option>
              <option value="view">View-only admin</option>
            </select>
          </label>

          <button type="button" onClick={onSave} style={{ marginTop: 12, fontWeight: 800 }}>
            Save settings
          </button>
          {savedAt ? (
            <p style={{ marginTop: 10, color: '#6b7280', fontWeight: 700 }}>
              Saved at {new Date(savedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminSettings;

