import React, { useState } from 'react';
import AdminLayout from '../Common/AdminLayout';
import TechnicianList from './TechnicianList';
import AssignTask from './AssignTask';
import '../adminShared.css';

const mockTechnicians = [
  { id: 1, name: 'John Dela Cruz', specialty: 'HVAC Install', status: 'Available' },
  { id: 2, name: 'Anne Ramos', specialty: 'Maintenance', status: 'On Task' }
];

const AdminTechnician = () => {
  const [selectedTech, setSelectedTech] = useState(null);

  return (
    <AdminLayout title="Technician Management" subtitle="Assign and monitor field teams">
      <div className="admin-grid-2">
        <TechnicianList technicians={mockTechnicians} onSelect={setSelectedTech} />
        <AssignTask technician={selectedTech} />
      </div>
    </AdminLayout>
  );
};

export default AdminTechnician;
