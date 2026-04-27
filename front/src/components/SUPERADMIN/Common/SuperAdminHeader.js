import React from 'react';
import { useUser } from '../../../context/UserContext';

const SuperAdminHeader = ({ title = 'Super Admin', subtitle = 'Executive control' }) => {
  const { user } = useUser();

  return (
    <header className="super-header">
      <div className="super-header-left">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <strong>{user?.name || 'Super Admin'}</strong>
    </header>
  );
};

export default SuperAdminHeader;
