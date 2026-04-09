import React from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import '../superAdminShared.css';

const pendingSales = [
  { id: 'PS-101', branch: 'North Hub', amount: 18500, status: 'For approval' },
  { id: 'PS-102', branch: 'South Hub', amount: 9200, status: 'Pending validation' },
  { id: 'PS-103', branch: 'North Hub', amount: 14500, status: 'Discrepancy flagged' }
];

const SuperAdminSales = () => {
  return (
    <SuperAdminLayout title="Pending Sales" subtitle="Review and approve unresolved sales entries">
      <div className="super-card">
        <h3>Pending Sales Queue</h3>
        <div className="super-list">
          {pendingSales.map((sale) => (
            <div key={sale.id} className="super-list-item">
              <strong>{sale.id}</strong>
              <p>Branch: {sale.branch}</p>
              <p>Amount: PHP {sale.amount.toLocaleString()}</p>
              <p>Status: {sale.status}</p>
            </div>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminSales;
