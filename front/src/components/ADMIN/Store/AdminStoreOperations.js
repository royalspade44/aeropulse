import React, { useMemo, useState } from 'react';
import AdminLayout from '../Common/AdminLayout';
import { useUser } from '../../../context/UserContext';
import { loadBranchNetwork, updateBranchOps } from '../../../domain/branches/branchNetworkStorage';
import '../adminShared.css';

const TOTP_DEMO = '123456';
const DEFAULT_BRANCH_LOCATIONS = {
  Bulacan: 'Bulacan',
  Cavite: 'Cavite',
  Laguna: 'Laguna',
  Bataan: 'Bataan',
  Pangasinan: 'Pangasinan',
  Ilocos: 'Ilocos',
};

const AdminStoreOperations = () => {
  const { user } = useUser();
  const [branches, setBranches] = useState(() => loadBranchNetwork());
  const [totp, setTotp] = useState('');
  const [serverTotp, setServerTotp] = useState('');
  const [error, setError] = useState('');

  const assignedBranch = useMemo(() => {
    const pickedBranch = localStorage.getItem('activeBranch') || user?.activeBranch || user?.assignedBranch || '';
    if (pickedBranch) {
      const matchedByName = branches.find((branch) => branch.name === pickedBranch);
      if (matchedByName) return matchedByName;
      return {
        id: pickedBranch.toLowerCase().replace(/\s+/g, '-'),
        name: pickedBranch,
        location: DEFAULT_BRANCH_LOCATIONS[pickedBranch] || pickedBranch,
        manager: 'TBD',
        branchAdmin: String(user?.email || '').toLowerCase(),
        storeStatus: 'open',
        serverStatus: 'online',
        networkHealth: 'stable',
      };
    }
    const email = String(user?.email || '').toLowerCase();
    return branches.find((branch) => branch.branchAdmin === email) || branches[0];
  }, [branches, user?.email, user?.activeBranch, user?.assignedBranch]);

  const refreshBranch = () => setBranches(loadBranchNetwork());

  const closeStore = () => {
    setError('');
    if (totp !== TOTP_DEMO) {
      setError('Invalid TOTP for store close confirmation.');
      return;
    }
    updateBranchOps(assignedBranch.id, { storeStatus: 'closed' });
    setTotp('');
    refreshBranch();
    alert('Store close confirmed. You can now shut down the branch server.');
  };

  const shutdownServer = () => {
    setError('');
    if (serverTotp !== TOTP_DEMO) {
      setError('Invalid TOTP for server shutdown.');
      return;
    }
    updateBranchOps(assignedBranch.id, {
      serverStatus: 'offline',
      networkHealth: 'scheduled-shutdown',
      requests: [...(assignedBranch.requests || []), 'Server was shut down by branch admin']
    });
    setServerTotp('');
    refreshBranch();
    alert('Server shut down confirmed. It is now safe to power off the branch computer.');
  };

  return (
    <AdminLayout title="Store" subtitle="Branch closing flow and server shutdown controls">
      <div className="admin-grid-2">
        <div className="admin-card">
          <h3>Branch Allocation</h3>
          <p><strong>Branch:</strong> {assignedBranch?.name}</p>
          <p><strong>Location:</strong> {assignedBranch?.location}</p>
          <p><strong>Manager:</strong> {assignedBranch?.manager}</p>
          <p><strong>Store:</strong> {assignedBranch?.storeStatus}</p>
          <p><strong>Server:</strong> {assignedBranch?.serverStatus}</p>
          <p><strong>Network:</strong> {assignedBranch?.networkHealth}</p>
          <p style={{ color: '#64748b', marginBottom: 0 }}>
            Demo TOTP: <strong>{TOTP_DEMO}</strong>
          </p>
        </div>

        <div className="admin-card">
          <h3>Close Store Flow</h3>
          <p>1) Go to Store</p>
          <p>2) Click on close store at the top</p>
          <p>3) Enter TOTP to confirm</p>
          <p>4) Click on shut down server before shutting down branch computer</p>
          <p>5) Enter TOTP to confirm</p>

          <label htmlFor="close-store-totp">Close store TOTP</label>
          <input
            id="close-store-totp"
            value={totp}
            onChange={(e) => setTotp(e.target.value)}
            placeholder="Enter 6-digit TOTP"
            maxLength={6}
          />
          <button type="button" onClick={closeStore} style={{ marginTop: 8 }}>
            Close Store
          </button>

          <label htmlFor="shutdown-server-totp" style={{ marginTop: 14, display: 'block' }}>
            Shut down server TOTP
          </label>
          <input
            id="shutdown-server-totp"
            value={serverTotp}
            onChange={(e) => setServerTotp(e.target.value)}
            placeholder="Enter 6-digit TOTP"
            maxLength={6}
          />
          <button type="button" onClick={shutdownServer} style={{ marginTop: 8 }}>
            Shut Down Server
          </button>

          {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStoreOperations;
