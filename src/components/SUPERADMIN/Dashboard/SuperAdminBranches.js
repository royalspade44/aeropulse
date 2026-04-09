import React, { useState } from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import '../superAdminShared.css';

const SuperAdminBranches = () => {
  const [branches, setBranches] = useState([
    { id: 1, name: 'North Hub', location: 'Quezon City', manager: 'Ana Dela Cruz' },
    { id: 2, name: 'South Hub', location: 'Makati', manager: 'Paolo Reyes' }
  ]);
  const [draft, setDraft] = useState({ name: '', location: '', manager: '' });

  return (
    <SuperAdminLayout title="Branch Location Handling" subtitle="Manage company branch information">
      <div className="super-grid-2">
        <div className="super-card">
          <h3>Branch List</h3>
          <div className="super-list">
            {branches.map((branch) => (
              <div key={branch.id} className="super-list-item">
                <strong>{branch.name}</strong>
                <p>{branch.location}</p>
                <p>Manager: {branch.manager}</p>
              </div>
            ))}
          </div>
        </div>
        <form
          className="super-card"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.name || !draft.location) return;
            setBranches((prev) => [...prev, { id: Date.now(), ...draft }]);
            setDraft({ name: '', location: '', manager: '' });
          }}
        >
          <h3>Add Branch</h3>
          <input placeholder="Branch name" value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} />
          <input placeholder="Location" value={draft.location} onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))} />
          <input placeholder="Manager" value={draft.manager} onChange={(e) => setDraft((p) => ({ ...p, manager: e.target.value }))} />
          <button type="submit">Save Branch</button>
        </form>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminBranches;
