import React from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import '../superAdminShared.css';

const attendanceRows = [
  { name: 'Admin Maria', role: 'Admin', branch: 'North Hub', status: 'Present' },
  { name: 'Tech John', role: 'Technician', branch: 'North Hub', status: 'On Site' },
  { name: 'Tech Anne', role: 'Technician', branch: 'South Hub', status: 'Absent' },
  { name: 'Admin Carlo', role: 'Admin', branch: 'South Hub', status: 'Present' }
];

const SuperAdminAttendance = () => {
  return (
    <SuperAdminLayout title="Attendance View" subtitle="Admins and technicians daily attendance">
      <div className="super-card">
        <h3>Attendance Today</h3>
        <div className="super-list">
          {attendanceRows.map((row) => (
            <div key={row.name} className="super-list-item">
              <strong>{row.name}</strong>
              <p>{row.role} · {row.branch}</p>
              <p>Status: {row.status}</p>
            </div>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAttendance;
