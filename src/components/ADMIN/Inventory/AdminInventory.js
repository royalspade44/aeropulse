import React, { useEffect, useState } from 'react';
import AdminLayout from '../Common/AdminLayout';
import AddProduct from './AddProduct';
import InventoryList from './InventoryList';
import { apiRequest } from '../../../config/api';
import '../adminShared.css';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await apiRequest('/products');
      setProducts(result.products || []);
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
    <AdminLayout title="Inventory" subtitle="Track and update stock">
      <div className="admin-grid-2">
        <AddProduct onCreated={() => load()} />
        <div>
          {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
          <InventoryList products={products} loading={loading} onRefresh={load} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;
