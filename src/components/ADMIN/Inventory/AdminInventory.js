import React, { useState } from 'react';
import AdminLayout from '../Common/AdminLayout';
import AddProduct from './AddProduct';
import InventoryList from './InventoryList';
import '../adminShared.css';

const defaultProducts = [
  { id: 1, name: 'Compressor Oil', sku: 'CO-001', stock: 28, price: 420 },
  { id: 2, name: 'AC Filter', sku: 'AF-010', stock: 9, price: 220 }
];

const AdminInventory = () => {
  const [products, setProducts] = useState(defaultProducts);

  return (
    <AdminLayout title="Inventory" subtitle="Track and update stock">
      <div className="admin-grid-2">
        <AddProduct onAdd={(item) => setProducts((prev) => [item, ...prev])} />
        <InventoryList products={products} />
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;
