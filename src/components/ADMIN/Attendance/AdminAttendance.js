import React, { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../../config/api';
import { useUser } from '../../../context/UserContext';
import AdminLayout from '../Common/AdminLayout';
import '../adminShared.css';

const STATUSES = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'on-site', label: 'On Site' },
  { value: 'remote', label: 'Remote' },
];

const AdminAttendance = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [today, setToday] = useState(null);

  const [form, setForm] = useState({
    status: 'present',
    branch: '',
    notes: '',
  });

  const displayName = useMemo(() => user?.name || user?.email || 'Admin', [user?.email, user?.name]);

  const loadToday = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await apiRequest('/attendance/me/today');
      setToday(result.attendance || null);
      if (result.attendance) {
        setForm({
          status: result.attendance.status,
          branch: result.attendance.branch || '',
          notes: result.attendance.notes || '',
        });
      } else {
        setForm((prev) => ({
          ...prev,
          branch: user?.branch || '',
        }));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const result = await apiRequest('/attendance/me', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setToday(result.attendance);
      alert('Attendance submitted.');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Attendance" subtitle="Submit your attendance for today">
      <div className="admin-grid-2">
        <form className="admin-form" onSubmit={submit}>
          <h3>My Attendance</h3>
          <p style={{ marginTop: 0, color: 'var(--admin-muted)' }}>
            Logged in as <strong>{displayName}</strong>
          </p>

          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              style={{ width: '100%', marginTop: 8 }}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <input
            value={form.branch}
            onChange={(e) => setForm((prev) => ({ ...prev, branch: e.target.value }))}
            placeholder="Branch (e.g. North Hub)"
          />
          <input
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Notes (optional)"
          />

          <button type="submit" disabled={saving}>
            {saving ? 'Submitting…' : 'Submit Attendance'}
          </button>

          {error && <p style={{ color: '#b91c1c', marginBottom: 0 }}>{error}</p>}
        </form>

        <div className="admin-card">
          <h3>Today</h3>
          {loading ? (
            <p>Loading…</p>
          ) : today ? (
            <>
              <p>
                <strong>Status:</strong> {today.status}
              </p>
              <p>
                <strong>Branch:</strong> {today.branch || '-'}
              </p>
              <p>
                <strong>Notes:</strong> {today.notes || '-'}
              </p>
              <p>
                <strong>Updated:</strong> {new Date(today.updatedAt).toLocaleString()}
              </p>
            </>
          ) : (
            <p>No submission yet today.</p>
          )}

          <button type="button" onClick={loadToday} style={{ marginTop: 10 }}>
            Refresh
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAttendance;

