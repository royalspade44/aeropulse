import React, { useEffect, useState } from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import { apiRequest } from '../../../config/api';
import { loadAttendanceLogs } from '../../../domain/attendance/attendanceStorage';
import '../superAdminShared.css';

const SuperAdminAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await apiRequest('/attendance/today');
      setRows(result.attendance || []);
    } catch (e) {
      setRows(loadAttendanceLogs());
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SuperAdminLayout title="Attendance View" subtitle="Super admin access for all branches, admins, and staff logs">
      <div className="super-card">
        <h3>Attendance Today</h3>
        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
        <div className="super-list">
          {loading ? (
            <p>Loading…</p>
          ) : rows.length ? (
            rows.map((row) => (
              <div key={row.id} className="super-list-item">
                <strong>{row.userName || row.userEmail || 'User'}</strong>
                <p>{row.role} · {row.branch || '-'}</p>
                <p>Status: {row.status}</p>
                <p>Early out: {row.earlyOutTime || '-'}</p>
              </div>
            ))
          ) : (
            <p>No attendance submissions yet today.</p>
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
