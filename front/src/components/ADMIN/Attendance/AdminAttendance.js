import React, { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../../config/api';
import { useUser } from '../../../context/UserContext';
import AdminLayout from '../Common/AdminLayout';
import '../adminShared.css';

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'leave', label: 'Leave' },
  { value: 'absent', label: 'Absent' },
  { value: 'on-site', label: 'On Site' },
  { value: 'remote', label: 'Remote' },
];

const ROLES = [
  { value: '', label: 'All roles' },
  { value: 'technician', label: 'Tech' },
  { value: 'admin', label: 'Admin' },
];

const AdminAttendance = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    userId: '',
    from: '',
    to: '',
  });
  const [editing, setEditing] = useState({ id: '', status: '', notes: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const displayName = useMemo(() => user?.name || user?.email || 'Admin', [user?.email, user?.name]);

  const loadUsers = async () => {
    try {
      const result = await apiRequest('/attendance/users');
      // Only include admin and technician users
      setUsers((result.users || []).filter(u => u.role === 'admin' || u.role === 'technician'));
    } catch (_e) {
      setUsers([]);
    }
  };

  const buildQuery = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('limit', '500');
    return params.toString();
  };

  const loadHistory = async () => {
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
    loadUsers();
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (event) => {
    event.preventDefault();
    loadHistory();
  };

  const startEdit = (row) => {
    setEditing({
      id: row.id,
      status: row.status || 'present',
      notes: row.notes || '',
    });
  };

  const saveEdit = async () => {
    if (!editing.id) return;
    try {
      setSavingEdit(true);
      await apiRequest(`/attendance/${editing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: editing.status, notes: editing.notes }),
      });
      setEditing({ id: '', status: '', notes: '' });
      await loadHistory();
    } catch (e) {
      alert(e.message || 'Unable to update attendance record');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <AdminLayout title="Attendance History" subtitle="Track attendance, leaves, absences, and late entries">
      <div className="admin-grid-2">
        <form className="admin-form" onSubmit={applyFilters}>
          <h3>Filters</h3>
          <p style={{ marginTop: 0, color: 'var(--admin-muted)' }}>
            Signed in as <strong>{displayName}</strong>
          </p>

          <label>
            User Role
            <select
              value={filters.role}
              onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
              style={{ width: '100%', marginTop: 8 }}
            >
              {ROLES.map((role) => (
                <option key={role.value || 'all'} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              style={{ width: '100%', marginTop: 8 }}
            >
              {STATUSES.map((status) => (
                <option key={status.value || 'all'} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            User
            <select
              value={filters.userId}
              onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value }))}
              style={{ width: '100%', marginTop: 8 }}
            >
              <option value="">All users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name || u.email}</option>
              ))}
            </select>
          </label>

          <label>
            Date From
            <input type="date" value={filters.from} onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))} />
          </label>
          <label>
            Date To
            <input type="date" value={filters.to} onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))} />
          </label>

          <button type="submit">
            Apply Filters
          </button>

          {error && <p style={{ color: '#b91c1c', marginBottom: 0 }}>{error}</p>}
        </form>

        <div className="admin-card">
          <h3>Summary Metrics</h3>
          {loading ? (
            <p>Loading…</p>
          ) : summary ? (
            <>
              <p>
                <strong>Total attendance count:</strong> {summary.totalCount}
              </p>
              <p>
                <strong>Present days:</strong> {summary.presentCount}
              </p>
              <p>
                <strong>Total leaves:</strong> {summary.leaveCount}
              </p>
              <p>
                <strong>Total absences:</strong> {summary.absentCount}
              </p>
              <p>
                <strong>Late entries:</strong> {summary.lateCount}
              </p>
              <p>
                <strong>Attendance rate:</strong> {summary.attendanceRate}%
              </p>
            </>
          ) : (
            <p>No data available.</p>
          )}

          <button type="button" onClick={loadHistory} style={{ marginTop: 10 }}>
            Refresh
          </button>
        </div>
      </div>
      <div className="admin-card" style={{ marginTop: 16 }}>
        <h3>Attendance History</h3>
        {loading ? (
          <p>Loading...</p>
        ) : rows.length ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Branch</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isEditing = editing.id === row.id;
                return (
                  <tr key={row.id}>
                    <td>{row.day}</td>
                    <td>{row.userName || row.userEmail || '-'}</td>
                    <td>{row.role}</td>
                    <td>
                      {isEditing ? (
                        <select value={editing.status} onChange={(e) => setEditing((prev) => ({ ...prev, status: e.target.value }))}>
                          {STATUSES.filter((item) => item.value).map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                          ))}
                        </select>
                      ) : row.status}
                    </td>
                    <td>{row.branch || '-'}</td>
                    <td>
                      {isEditing ? (
                        <input value={editing.notes} onChange={(e) => setEditing((prev) => ({ ...prev, notes: e.target.value }))} />
                      ) : (row.notes || '-')}
                    </td>
                    <td>
                      {isEditing ? (
                        <>
                          <button type="button" onClick={saveEdit} disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save'}</button>{' '}
                          <button type="button" onClick={() => setEditing({ id: '', status: '', notes: '' })}>Cancel</button>
                        </>
                      ) : (
                        <button type="button" onClick={() => startEdit(row)}>Edit</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No attendance records found for selected filters.</p>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAttendance;

