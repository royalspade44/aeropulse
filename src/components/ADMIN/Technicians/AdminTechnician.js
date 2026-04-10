import React, { useEffect, useState } from 'react';
import AdminLayout from '../Common/AdminLayout';
import TechnicianList from './TechnicianList';
import AssignTask from './AssignTask';
import { apiRequest } from '../../../config/api';
import '../adminShared.css';

const AdminTechnician = () => {
  const [selectedTech, setSelectedTech] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await apiRequest('/users?role=technician');
      const mapped = (result.users || []).map((u) => ({
        id: u.id,
        name: u.name || `${u.name_first || ''} ${u.name_last || ''}`.trim() || u.email,
        specialty: u.department || (u.skills?.[0] || 'Technician'),
        status: 'Available',
      }));
      setTechnicians(mapped);
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
    <AdminLayout title="Technician Management" subtitle="Assign and monitor field teams">
      <div className="admin-grid-2">
        <div>
          {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
          {loading ? <p>Loading…</p> : null}
          <TechnicianList technicians={technicians} onSelect={setSelectedTech} />
          <button type="button" onClick={load} style={{ marginTop: 10 }}>
            Refresh
          </button>
        </div>
        <AssignTask technician={selectedTech} />
      </div>
    </AdminLayout>
  );
};

export default AdminTechnician;
