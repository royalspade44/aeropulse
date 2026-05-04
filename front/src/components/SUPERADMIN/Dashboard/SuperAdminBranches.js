import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import { apiRequest } from '../../../config/api';
import '../superAdminShared.css';

const SuperAdminBranches = () => {
  // Removed unused: branches, setBranches
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState({ name: '', location: '', manager: '', adminId: '', needs: '', requests: '' });

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch admins for the dropdown
        const adminData = await apiRequest('/users?role=admin');
        const adminsList = Array.isArray(adminData?.users) ? adminData.users : [];
        if (active) setAdmins(adminsList);
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load admins');
          setAdmins([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  // Removed unused: getAdminForBranch

  const formatLastLogin = (date) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <SuperAdminLayout title="Branch Location Handling" subtitle="Monitor branch allocation, network status, needs, and requests">
      <div className="super-grid-2">
        <div className="super-card">
          <h3>Branch Allocation and Admin Assignment</h3>
          <div className="super-list">
            {loading && <p>Loading branches and admins...</p>}
            {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
            {!loading && admins.length > 0 && admins
              .filter(admin => admin.assignedBranch)
              .map((admin) => (
                <div key={admin.id} className="super-list-item">
                  <strong>{admin.assignedBranch}</strong>
                  <p>Admin: {admin.name}</p>
                  <p>Email: {admin.email}</p>
                  <p>Last Login: {formatLastLogin(admin.lastLogin)}</p>
                  <p>Phone: {admin.phone || '-'}</p>
                  <p>Address: {admin.address || '-'}</p>
                </div>
              ))}
            {!loading && admins.filter(a => a.assignedBranch).length === 0 && (
              <p>No admins assigned to branches yet.</p>
            )}
          </div>
        </div>
        
        <form
          className="super-card"
          onSubmit={(e) => {
            e.preventDefault();
            alert('Branch assignment feature coming soon. Use admin user management to assign branches.');
            setDraft({ name: '', location: '', manager: '', adminId: '', needs: '', requests: '' });
          }}
        >
          <h3>Manage Branch</h3>
          <select 
            value={draft.adminId} 
            onChange={(e) => setDraft((p) => ({ ...p, adminId: e.target.value }))}
            placeholder="Select admin"
            style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">Select Admin...</option>
            {admins.filter(a => !a.assignedBranch).map(admin => (
              <option key={admin.id} value={admin.id}>{admin.name} ({admin.email})</option>
            ))}
          </select>
          <input 
            placeholder="Branch name" 
            value={draft.name} 
            onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} 
            style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            placeholder="Location" 
            value={draft.location} 
            onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))} 
            style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            placeholder="Current need" 
            value={draft.needs} 
            onChange={(e) => setDraft((p) => ({ ...p, needs: e.target.value }))} 
            style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            placeholder="Request for HQ" 
            value={draft.requests} 
            onChange={(e) => setDraft((p) => ({ ...p, requests: e.target.value }))} 
            style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer' }}>
            Assign Branch to Admin
          </button>
        </form>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminBranches;
