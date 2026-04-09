import React from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import '../superAdminShared.css';

const pendingTasks = [
  { code: 'TK-110', technician: 'John Dela Cruz', customer: 'M. Santos', agingHours: 30, status: 'Pending' },
  { code: 'TK-111', technician: 'Anne Ramos', customer: 'R. Tan', agingHours: 18, status: 'In Progress' },
  { code: 'TK-112', technician: 'Mark Pineda', customer: 'L. Reyes', agingHours: 40, status: 'Pending' }
];

const SuperAdminTasks = () => {
  return (
    <SuperAdminLayout title="Pending Tech Tasks" subtitle="Overdue or unresolved field work">
      <div className="super-card">
        <h3>Task Escalation Queue</h3>
        <div className="super-list">
          {pendingTasks.map((task) => (
            <div key={task.code} className="super-list-item">
              <strong>{task.code}</strong>
              <p>Technician: {task.technician}</p>
              <p>Customer: {task.customer}</p>
              <p>Status: {task.status}</p>
              <p>Aging: {task.agingHours} hours</p>
            </div>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminTasks;
