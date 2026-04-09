import React, { useState } from 'react';
import SuperAdminHeader from './SuperAdminHeader';
import SuperAdminSidebar from './SuperAdminSidebar';
import '../superAdminShared.css';

const SuperAdminLayout = ({ title, subtitle, children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="super-layout">
      <SuperAdminSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="super-layout-main">
        <SuperAdminHeader title={title} subtitle={subtitle} onMenuToggle={() => setMenuOpen((open) => !open)} />
        {children}
      </div>
      {menuOpen && <div className="super-menu-overlay" onClick={() => setMenuOpen(false)} />}
    </div>
  );
};

export default SuperAdminLayout;
