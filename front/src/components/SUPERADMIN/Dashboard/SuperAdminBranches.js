import React, { useState } from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import { loadBranchNetwork, upsertBranch } from '../../../domain/branches/branchNetworkStorage';
import '../superAdminShared.css';

const SuperAdminBranches = () => {
  const [branches, setBranches] = useState(() => loadBranchNetwork());
  const [draft, setDraft] = useState({ name: '', location: '', manager: '', needs: '', requests: '' });

  return (
    <SuperAdminLayout title="Branch Location Handling" subtitle="Monitor branch allocation, network status, needs, and requests">
      <div className="super-grid-2">
        <div className="super-card">
          <h3>Branch Allocation and Server Network</h3>
          <div className="super-list">
            {branches.map((branch) => (
              <div key={branch.id} className="super-list-item">
                <strong>{branch.name}</strong>
                <p>{branch.location}</p>
                <p>Manager: {branch.manager}</p>
                <p>Branch Admin: {branch.branchAdmin || '-'}</p>
                <p>Store: {branch.storeStatus || 'open'} · Server: {branch.serverStatus || 'online'}</p>
                <p>Network: {branch.networkHealth || 'stable'}</p>
                <p>Needs: {(branch.needs || []).join(', ') || '-'}</p>
                <p>Requests: {(branch.requests || []).join(', ') || '-'}</p>
              </div>
            ))}
          </div>
        </div>
        <form
          className="super-card"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.name || !draft.location) return;
            const next = {
              id: draft.name.toLowerCase().replace(/\s+/g, '-'),
              name: draft.name,
              location: draft.location,
              manager: draft.manager,
              branchAdmin: `${draft.name.toLowerCase().replace(/\s+/g, '.')}@aeropulse.com`,
              storeStatus: 'open',
              serverStatus: 'online',
              networkHealth: 'stable',
              needs: draft.needs ? [draft.needs] : [],
              requests: draft.requests ? [draft.requests] : []
            };
            upsertBranch(next);
            setBranches(loadBranchNetwork());
            setDraft({ name: '', location: '', manager: '', needs: '', requests: '' });
          }}
        >
          <h3>Add Branch</h3>
          <input placeholder="Branch name" value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} />
          <input placeholder="Location" value={draft.location} onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))} />
          <input placeholder="Manager" value={draft.manager} onChange={(e) => setDraft((p) => ({ ...p, manager: e.target.value }))} />
          <input placeholder="Current need" value={draft.needs} onChange={(e) => setDraft((p) => ({ ...p, needs: e.target.value }))} />
          <input placeholder="Request for HQ" value={draft.requests} onChange={(e) => setDraft((p) => ({ ...p, requests: e.target.value }))} />
          <button type="submit">Save Branch</button>
        </form>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminBranches;
