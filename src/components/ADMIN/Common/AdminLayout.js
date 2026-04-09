import React, { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import './AdminHeader.css';
import './AdminSidebar.css';
import '../adminShared.css';

const AdminLayout = ({ title, subtitle, children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={`admin-layout ${menuOpen ? 'menu-open' : ''}`}>
      <AdminSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="admin-layout-main">
        <AdminHeader
          title={title}
          subtitle={subtitle}
          onMenuToggle={() => setMenuOpen((open) => !open)}
        />
        <div className="admin-layout-content">{children}</div>
      </div>
      {menuOpen && <div className="admin-menu-overlay" onClick={() => setMenuOpen(false)} />}
    </div>
  );
};

export default AdminLayout;
