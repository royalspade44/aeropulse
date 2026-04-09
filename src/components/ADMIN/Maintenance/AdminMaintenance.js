import React, { useState } from 'react';
import AdminLayout from '../Common/AdminLayout';
import ServiceRequests from './ServiceRequests';
import RequestDetails from './RequestDetails';
import '../adminShared.css';

const mockRequests = [
  { id: 1001, customer: 'Maria Reyes', issue: 'Leaking indoor unit', address: 'Caloocan City', status: 'Pending' },
  { id: 1002, customer: 'John Tan', issue: 'No cooling', address: 'Quezon City', status: 'In Progress' }
];

const AdminMaintenance = () => {
  const [selected, setSelected] = useState(null);

  return (
    <AdminLayout title="Maintenance" subtitle="Handle service operations">
      <div className="admin-grid-2">
        <ServiceRequests requests={mockRequests} onSelect={setSelected} />
        <RequestDetails request={selected} />
      </div>
    </AdminLayout>
  );
};

export default AdminMaintenance;
