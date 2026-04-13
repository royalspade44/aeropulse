import React, { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../../config/api';
import { useUser } from '../../../context/UserContext';
import AdminLayout from '../Common/AdminLayout';
import { loadAttendanceLogs, logEarlyOut, upsertAttendanceLog } from '../../../domain/attendance/attendanceStorage';
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
  const [staffLogs, setStaffLogs] = useState(() => loadAttendanceLogs());
  const [staffForm, setStaffForm] = useState({ staffName: '', role: 'technician', status: 'present', branch: '' });
  const [earlyOut, setEarlyOut] = useState({ id: '', earlyOutTime: '', reason: '' });

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
      // Fallback to local tracker when attendance API is unavailable.
      const todayDate = new Date().toISOString().split('T')[0];
      const local = loadAttendanceLogs().find((row) => row.date === todayDate && row.staffEmail === user?.email);
      setToday(local || null);
      setStaffForm((prev) => ({ ...prev, branch: user?.branch || '' }));
      if (!local) setError(e.message);
    } finally {
      setLoading(false);
      setStaffLogs(loadAttendanceLogs());
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
      const row = upsertAttendanceLog({
        staffName: displayName,
        staffEmail: user?.email,
        role: user?.role || 'admin',
        date: new Date().toISOString().split('T')[0],
        status: form.status,
        branch: form.branch,
        notes: form.notes
      });
      setToday(row);
      alert('Attendance submitted to branch tracker.');
      setError('');
    } finally {
      setSaving(false);
      setStaffLogs(loadAttendanceLogs());
    }
  };

  const addOrUpdateStaff = (event) => {
    event.preventDefault();
    if (!staffForm.staffName.trim()) return;
    upsertAttendanceLog({
      ...staffForm,
      date: new Date().toISOString().split('T')[0],
      modifiedBy: displayName
    });
    setStaffForm((prev) => ({ ...prev, staffName: '' }));
    setStaffLogs(loadAttendanceLogs());
  };

  const submitEarlyOut = (event) => {
    event.preventDefault();
    if (!earlyOut.id || !earlyOut.earlyOutTime) return;
    logEarlyOut({
      id: earlyOut.id,
      earlyOutTime: earlyOut.earlyOutTime,
      reason: earlyOut.reason,
      modifiedBy: displayName
    });
    setEarlyOut({ id: '', earlyOutTime: '', reason: '' });
    setStaffLogs(loadAttendanceLogs());
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
      <div className="admin-grid-2" style={{ marginTop: 16 }}>
        <form className="admin-form" onSubmit={addOrUpdateStaff}>
          <h3>Staff Attendance Tracker (Branch Manager)</h3>
          <p style={{ marginTop: 0, color: 'var(--admin-muted)' }}>
            Go to Staff, open member row or kebab action, and log attendance changes.
          </p>
          <input
            placeholder="Staff name"
            value={staffForm.staffName}
            onChange={(e) => setStaffForm((prev) => ({ ...prev, staffName: e.target.value }))}
          />
          <select
            value={staffForm.role}
            onChange={(e) => setStaffForm((prev) => ({ ...prev, role: e.target.value }))}
          >
            <option value="technician">Technician</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
          <select
            value={staffForm.status}
            onChange={(e) => setStaffForm((prev) => ({ ...prev, status: e.target.value }))}
          >
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <input
            placeholder="Branch"
            value={staffForm.branch}
            onChange={(e) => setStaffForm((prev) => ({ ...prev, branch: e.target.value }))}
          />
          <button type="submit">Save Staff Attendance</button>
        </form>

        <form className="admin-form" onSubmit={submitEarlyOut}>
          <h3>Log Early Out</h3>
          <select
            value={earlyOut.id}
            onChange={(e) => setEarlyOut((prev) => ({ ...prev, id: e.target.value }))}
          >
            <option value="">Select staff</option>
            {staffLogs.map((row) => (
              <option key={row.id} value={row.id}>{row.staffName} ({row.branch || '-'})</option>
            ))}
          </select>
          <input
            type="time"
            value={earlyOut.earlyOutTime}
            onChange={(e) => setEarlyOut((prev) => ({ ...prev, earlyOutTime: e.target.value }))}
          />
          <input
            placeholder="Reason"
            value={earlyOut.reason}
            onChange={(e) => setEarlyOut((prev) => ({ ...prev, reason: e.target.value }))}
          />
          <button type="submit">Log Early Out</button>
        </form>
      </div>
      <div className="admin-card" style={{ marginTop: 16 }}>
        <h3>Staff Attendance Records</h3>
        {staffLogs.length ? (
          <div className="admin-list">
            {staffLogs.map((row) => (
              <div key={row.id} className="admin-list-item">
                <strong>{row.staffName || row.staffEmail}</strong>
                <p>{row.role} · {row.branch || '-'}</p>
                <p>Status: {row.status}</p>
                <p>Early out: {row.earlyOutTime || '-'}</p>
              </div>
            ))}
          </div>
        ) : <p>No records yet.</p>}
      </div>
    </AdminLayout>
  );
};

export default AdminAttendance;

