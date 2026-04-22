import React, { useEffect, useState } from 'react';
import AdminLayout from '../Common/AdminLayout';
import LowStockItems from './LowStockItems';
import ReorderForm from './ReorderForm';
import { apiRequest } from '../../../config/api';
import '../adminShared.css';
import './styles.css';

const AdminReoder = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await apiRequest('/products/low-stock');
      setItems(result.products || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminLayout title="Reorder Management" subtitle="Track low stock and submit purchase requests">
      <div className="admin-grid-2">
        <div>
          {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
          {loading ? <p>Loading…</p> : null}
          <LowStockItems items={items} onSelect={setSelectedItem} />
          <button type="button" onClick={load} style={{ marginTop: 10 }}>
            Refresh
          </button>
        </div>
        <ReorderForm item={selectedItem} onSubmitted={() => load()} />
      </div>
    </AdminLayout>
  );
};

export default AdminReoder;
