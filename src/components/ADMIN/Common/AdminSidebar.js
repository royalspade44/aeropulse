import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { confirmDialog } from '../../../utils/dialog';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/inventory', label: 'Inventory', icon: '📦' },
  { to: '/admin/maintenance', label: 'Maintenance', icon: '🛠️' },
  { to: '/admin/technicians', label: 'Technicians', icon: '🔧' },
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

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="admin-sidebar-brand-row">
        <div className="admin-sidebar-brand">AeroPulse Admin</div>
        <button className="admin-sidebar-close" onClick={onClose} type="button">
          ✕
        </button>
      </div>
      <nav className="admin-sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <button className="admin-sidebar-logout" onClick={handleLogout} type="button">
        🚪 Logout
      </button>
    </aside>
  );
};

export default AdminSidebar;
