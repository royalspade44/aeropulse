import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { confirmDialog } from '../../../utils/dialog';
import './AdminSidebar.css';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/inventory', label: 'Inventory', icon: '📦' },
  { to: '/admin/maintenance', label: 'Maintenance', icon: '🛠️' },
  { to: '/admin/technicians', label: 'Technicians', icon: '🔧' },
  { to: '/admin/attendance', label: 'Attendance', icon: '🕒' },
  { to: '/admin/unlock-users', label: 'Unlock Users', icon: '🔓' },
  { to: '/admin/reorder', label: 'Reorder', icon: '🧾' },
  { to: '/admin/profile', label: 'Profile', icon: '👤' }
];

const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmed = await confirmDialog('Are you sure you want to log out?', 'Logout');
    if (!confirmed) return;
    logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) onClose?.();
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="admin-sidebar-brand-row">
        <div className="admin-sidebar-brand">
          <span className="brand-icon">✈️</span>
          <span>AeroPulse</span>
        </div>
        <button className="admin-sidebar-close" onClick={onClose} type="button" aria-label="Close menu">
          ✕
        </button>
      </div>

      <nav className="admin-sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-sidebar-logout" onClick={handleLogout} type="button">
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;