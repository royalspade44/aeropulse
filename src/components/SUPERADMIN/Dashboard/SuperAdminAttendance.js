import React, { useEffect, useState } from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import { apiRequest } from '../../../config/api';
import '../superAdminShared.css';

const SuperAdminAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({ role: '', from: '', to: '' });

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filters.role) params.set('role', filters.role);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    params.set('limit', '1000');
    return params.toString();
  };

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await apiRequest(`/attendance/history?${buildQuery()}`);
      setRows(result.attendance || []);
      setSummary(result.summary || null);
    } catch (e) {
      setRows([]);
      setSummary(null);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SuperAdminLayout title="Attendance History" subtitle="Cross-branch attendance analytics and audit">
      <div className="super-card">
        <h3>Filters</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <select value={filters.role} onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}>
            <option value="">All roles</option>
            <option value="customer">Customer</option>
            <option value="technician">Tech</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
          <input type="date" value={filters.from} onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))} />
          <input type="date" value={filters.to} onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))} />
          <button type="button" onClick={load}>Apply</button>
        </div>

        {summary && (
          <div style={{ marginBottom: 12 }}>
            <p><strong>Total:</strong> {summary.totalCount} | <strong>Present:</strong> {summary.presentCount} | <strong>Late:</strong> {summary.lateCount}</p>
            <p><strong>Leaves:</strong> {summary.leaveCount} | <strong>Absences:</strong> {summary.absentCount} | <strong>Rate:</strong> {summary.attendanceRate}%</p>
          </div>
        )}

        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
        <div className="super-list">
          {loading ? (
            <p>Loading…</p>
          ) : rows.length ? (
            <table className="super-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Branch</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.day}</td>
                    <td>{row.userName || row.userEmail || 'User'}</td>
                    <td>{row.role}</td>
                    <td>{row.status}</td>
                    <td>{row.branch || '-'}</td>
                    <td>{row.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No attendance records found.</p>
          )}
        </div>

        <button type="button" onClick={load} style={{ marginTop: 10 }}>
          Refresh
        </button>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAttendance;
