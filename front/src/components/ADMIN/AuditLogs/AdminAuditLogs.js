import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../Common/AdminLayout';
import { loadAuditLogs } from '../../../utils/auditLogs';
import '../adminShared.css';

const withinRange = (iso, from, to) => {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  const fromT = from ? new Date(from).getTime() : null;
  const toT = to ? new Date(to).getTime() : null;
  if (fromT && t < fromT) return false;
  if (toT && t > toT + 24 * 60 * 60 * 1000 - 1) return false;
  return true;
};

function AdminAuditLogs() {
  const [filters, setFilters] = useState({ user: '', from: '', to: '' });
  const [logs, setLogs] = useState(() => loadAuditLogs());

  useEffect(() => {
    const onStorage = (event) => {
      if (!event.key) return;
      if (!String(event.key).startsWith('aeropulse_admin_audit_logs')) return;
      setLogs(loadAuditLogs());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (filters.user && !String(l.user || '').toLowerCase().includes(filters.user.toLowerCase())) return false;
      if ((filters.from || filters.to) && !withinRange(l.timestamp, filters.from, filters.to)) return false;
      return true;
    });
  }, [logs, filters.from, filters.to, filters.user]);

  return (
    <AdminLayout title="Audit Logs" subtitle="Track important admin actions (inventory, orders, settings, unlocks)">
      <div className="admin-grid-2">
        <div className="admin-card">
          <h3>Filters</h3>
          <div className="admin-field-group">
            <label>
              User contains
              <input value={filters.user} onChange={(e) => setFilters((p) => ({ ...p, user: e.target.value }))} placeholder="email or name" />
            </label>
            <label>
              Date from
              <input type="date" value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} />
            </label>
            <label>
              Date to
              <input type="date" value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} />
            </label>
          </div>
          <div className="admin-card-actions">
            <button type="button" onClick={() => setLogs(loadAuditLogs())}>
              Refresh
            </button>
          </div>
        </div>

        <div className="admin-card">
          <h3>Summary</h3>
          <div className="admin-summary-list">
            <div className="admin-summary-item">
              <span>Total logs</span>
              <strong>{logs.length}</strong>
            </div>
            <div className="admin-summary-item">
              <span>Filtered</span>
              <strong>{filtered.length}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card admin-card--spacious admin-card--spaced">
        <h3>Entries</h3>
        {filtered.length === 0 ? (
          <div className="admin-empty-state">No logs match the selected filters.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.timestamp).toLocaleString()}</td>
                    <td>{row.user}</td>
                    <td>{row.action}</td>
                    <td className="admin-table-cell-truncate" title={row.details}>
                      {row.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminAuditLogs;

