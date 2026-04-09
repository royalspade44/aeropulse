import React, { useState } from 'react';
import AdminLayout from '../Common/AdminLayout';
import LowStockItems from './LowStockItems';
import ReorderForm from './ReorderForm';
import '../adminShared.css';

const mockItems = [
  { id: 1, name: 'AC Filter', stock: 5, threshold: 15 },
  { id: 2, name: 'Copper Pipe', stock: 8, threshold: 20 }
];

const AdminReoder = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <AdminLayout title="Reorder Management" subtitle="Track low stock and submit purchase requests">
      <div className="admin-grid-2">
        <LowStockItems items={mockItems} onSelect={setSelectedItem} />
        <ReorderForm item={selectedItem} />
      </div>
    </AdminLayout>
  );
};

export default AdminReoder;
