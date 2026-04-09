import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { confirmDialog } from '../../../utils/dialog';

const items = [
  { to: '/tech/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/tech/tasks', label: 'Tasks', icon: '📋' },
  { to: '/tech/profile', label: 'Profile', icon: '👤' }
];

const TechSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useUser();

  const handleLogout = async () => {
    const confirmed = await confirmDialog('Are you sure you want to log out?', 'Logout');
    if (!confirmed) return;
    logout();
    navigate('/login');
  };

  return (
    <aside className={`tech-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="tech-sidebar-brand-row">
        <div className="tech-sidebar-brand">AeroPulse Tech</div>
        <button type="button" className="tech-sidebar-close" onClick={onClose}>✕</button>
      </div>
      <nav className="tech-sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `tech-sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        className="tech-sidebar-logout"
        onClick={handleLogout}
      >
        🚪 Logout
      </button>
    </aside>
  );
};

export default TechSidebar;
