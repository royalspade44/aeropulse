import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '../Common/AdminLayout';
import { apiRequest } from '../../../config/api';
import '../adminShared.css';

function AdminAuditLogs() {
  const [filters, setFilters] = useState({ user: '', from: '', to: '' });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.user) params.append('user', filters.user);
      const response = await apiRequest(`/reports/audit-logs?${params.toString()}`);
      setLogs(response.logs || []);
    } catch (err) {
      setError(err.message || 'Failed to load audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filtered = useMemo(() => {
    // Since filtering is done server-side, just return logs
    return logs;
  }, [logs]);

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
            <button type="button" onClick={loadLogs} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
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
        {error && <div className="admin-error">{error}</div>}
        {loading ? (
          <div className="admin-empty-state">Loading audit logs...</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty-state">No logs match the selected filters.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Description</th>
                  <th>Branch</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.timestamp).toLocaleString()}</td>
                    <td>{row.user}</td>
                    <td>{row.action.replace(/_/g, ' ')}</td>
                    <td className="admin-table-cell-truncate" title={row.description}>
                      {row.description}
                    </td>
                    <td>{row.branch || '—'}</td>
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

