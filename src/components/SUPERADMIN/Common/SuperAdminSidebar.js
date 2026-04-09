import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { confirmDialog } from '../../../utils/dialog';

const links = [
  { to: '/superadmin/dashboard', label: 'Command Center', icon: '🧠' },
  { to: '/superadmin/branches', label: 'Branch Locations', icon: '📍' },
  { to: '/superadmin/attendance', label: 'Attendance', icon: '🕒' },
  { to: '/superadmin/sales', label: 'Pending Sales', icon: '💰' },
  { to: '/superadmin/inventory', label: 'Inventory Checker', icon: '📦' },
  { to: '/superadmin/tasks', label: 'Pending Tech Tasks', icon: '📋' },
  { to: '/superadmin/alerts', label: 'Customer Alerts', icon: '🚨' }
];

const SuperAdminSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useUser();

  const handleLogout = async () => {
    const confirmed = await confirmDialog('Are you sure you want to log out?', 'Logout');
    if (!confirmed) return;
    logout();
    navigate('/login');
  };

  return (
    <aside className={`super-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="super-sidebar-top">
        <div className="super-sidebar-brand">AeroPulse HQ</div>
        <button type="button" className="super-close" onClick={onClose}>✕</button>
      </div>
      <nav className="super-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `super-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        className="super-logout"
        onClick={handleLogout}
      >
        🚪 Logout
      </button>
    </aside>
  );
};

export default SuperAdminSidebar;
