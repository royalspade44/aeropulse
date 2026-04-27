import React, { useEffect, useState } from 'react';
import AdminLayout from '../Common/AdminLayout';
import { apiRequest } from '../../../config/api';
import '../adminShared.css';

const AdminUnlockUsers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await apiRequest('/users?locked=true');
      setUsers(result.users || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unlock = async (id) => {
    try {
      await apiRequest(`/users/${id}/unlock`, { method: 'POST' });
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <AdminLayout title="Unlock Users" subtitle="Admins can unlock locked accounts early">
      <div className="admin-card">
        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
        {loading ? <p>Loading…</p> : null}

        {!loading && users.length === 0 ? <p>No locked users right now.</p> : null}

        {users.map((u) => (
          <div key={u.id} className="admin-list-item" style={{ cursor: 'default' }}>
            <strong>{u.name || `${u.name_first || ''} ${u.name_last || ''}`.trim() || u.email}</strong>
            <span>{u.email}</span>
            <span>Role: {u.role}</span>
            <button type="button" onClick={() => unlock(u.id)} style={{ marginTop: 8 }}>
              Unlock
            </button>
          </div>
        ))}

        <button type="button" onClick={load} style={{ marginTop: 10 }}>
          Refresh
        </button>
      </div>
    </AdminLayout>
  );
};

export default AdminUnlockUsers;

