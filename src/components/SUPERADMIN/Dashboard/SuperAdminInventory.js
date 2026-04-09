import React from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import '../superAdminShared.css';

const inventoryAlerts = [
  { item: 'AC Filter', branch: 'North Hub', stock: 5, threshold: 15, level: 'Critical' },
  { item: 'Copper Tube', branch: 'South Hub', stock: 8, threshold: 20, level: 'Low' },
  { item: 'Refrigerant R32', branch: 'North Hub', stock: 12, threshold: 25, level: 'Low' }
];

const SuperAdminInventory = () => {
  return (
    <SuperAdminLayout title="Inventory Checker" subtitle="Monitor low stock across all branches">
      <div className="super-card">
        <h3>Inventory Risk Board</h3>
        <div className="super-list">
          {inventoryAlerts.map((alert) => (
            <div key={`${alert.branch}-${alert.item}`} className="super-list-item">
              <strong>{alert.item}</strong>
              <p>{alert.branch}</p>
              <p>Stock: {alert.stock} / Threshold: {alert.threshold}</p>
              <p>Level: {alert.level}</p>
            </div>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminInventory;
