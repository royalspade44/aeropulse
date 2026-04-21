import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../config/api';
import { BRANCHES } from '../../../domain/branches/branches';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import '../superAdminShared.css';

const SuperAdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/products')
      .then((data) => setProducts(data.products || []))
      .catch((err) => setError(err.message || 'Unable to load inventory'));
  }, []);

  const alerts = [];
  products.forEach((product) => {
    const branchStock = product.branchStock || {};
    BRANCHES.forEach((branch) => {
      const stock = Number(branchStock[branch] || 0);
      const threshold = Number(product.threshold || 0);
      if (threshold > 0 && stock < threshold) {
        alerts.push({
          id: `${product.id}-${branch}`,
          item: product.name,
          branch,
          stock,
          threshold,
          level: stock <= Math.floor(threshold * 0.5) ? 'Critical' : 'Low',
        });
      }
    });
  });

  return (
    <SuperAdminLayout title="Inventory Checker" subtitle="Monitor low stock across all branches">
      <div className="super-card">
        <h3>Inventory Risk Board</h3>
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
        <div className="super-list">
          {alerts.length === 0 ? <p>No low stock alerts right now.</p> : null}
          {alerts.map((alert) => (
            <div key={alert.id} className="super-list-item">
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
