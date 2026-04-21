import React from 'react';
import AdminLayout from '../Common/AdminLayout';
import '../adminShared.css';
import './SuperAdminProfile.css';

const SuperAdminProfile = () => {
  return (
    <AdminLayout title="Super Admin Profile" subtitle="Highest-level account settings">
      <div className="admin-card">
        <h3>Super Admin Controls</h3>
        <p>Use this profile area to review platform-wide controls and security posture.</p>
      </div>
    </AdminLayout>
  );
};

export default SuperAdminProfile;
