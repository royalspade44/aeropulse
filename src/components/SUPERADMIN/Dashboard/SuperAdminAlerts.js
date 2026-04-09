import React from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import '../superAdminShared.css';

const complaintAlerts = [
  { id: 'AL-2001', customer: 'Patricia Lim', branch: 'South Hub', concern: 'No follow-up after service', severity: 'High' },
  { id: 'AL-2002', customer: 'Daniel Cruz', branch: 'North Hub', concern: 'Repeated repair issue', severity: 'High' },
  { id: 'AL-2003', customer: 'Erika Chua', branch: 'North Hub', concern: 'Late technician arrival', severity: 'Medium' }
];

const SuperAdminAlerts = () => {
  return (
    <SuperAdminLayout title="Customer Complaint Alerts" subtitle="Critical customer concerns requiring executive review">
      <div className="super-card">
        <h3>Complaint Alert Feed</h3>
        <div className="super-list">
          {complaintAlerts.map((alert) => (
            <div key={alert.id} className="super-list-item">
              <strong>{alert.id}</strong>
              <p>Customer: {alert.customer}</p>
              <p>Branch: {alert.branch}</p>
              <p>Concern: {alert.concern}</p>
              <p>Severity: {alert.severity}</p>
            </div>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAlerts;
