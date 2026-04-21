import React, { useEffect, useState } from 'react';
import AdminLayout from '../Common/AdminLayout';
import ServiceRequests from './ServiceRequests';
import RequestDetails from './RequestDetails';
import { apiRequest } from '../../../config/api';
import '../adminShared.css';
import './AdminMaintenance.css';

const AdminMaintenance = () => {
  const [selected, setSelected] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await apiRequest('/service-requests');
      setRequests(result.requests || []);
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
    <AdminLayout title="Maintenance" subtitle="Handle service operations">
      <div className="admin-grid-2">
        <div>
          {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
          {loading ? <p>Loading…</p> : null}
          <ServiceRequests requests={requests} onSelect={setSelected} />
          <button type="button" onClick={load} style={{ marginTop: 10 }}>
            Refresh
          </button>
        </div>
        <RequestDetails request={selected} />
      </div>
    </AdminLayout>
  );
};

export default AdminMaintenance;
