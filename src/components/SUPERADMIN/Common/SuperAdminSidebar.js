import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { confirmDialog } from '../../../utils/dialog';
import icons from '../../common/icons';

const links = [
  { to: '/superadmin/dashboard', label: 'Command Center', icon: icons.shieldKeyhole },
  { to: '/superadmin/branches', label: 'Branch Locations', icon: icons.marker },
  { to: '/superadmin/attendance', label: 'Attendance', icon: icons.clipboardList },
  { to: '/superadmin/sales', label: 'Pending Sales', icon: icons.cartShoppingFast },
  { to: '/superadmin/inventory', label: 'Inventory Checker', icon: icons.boxOpen },
  { to: '/superadmin/tasks', label: 'Pending Tech Tasks', icon: icons.tools },
  { to: '/superadmin/alerts', label: 'Customer Alerts', icon: icons.diamondExclamation }
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
        <button type="button" className="super-close" onClick={onClose}>{'\u2715'}</button>
      </div>
      <nav className="super-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `super-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="super-nav-icon-wrap">
              <img src={link.icon} alt="" className="inline-icon inline-icon--md" />
            </span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        className="super-logout"
        onClick={handleLogout}
      >
        <img src={icons.signOutAlt} alt="" className="inline-icon inline-icon--md" /> Logout
      </button>
    </aside>
  );
};

export default SuperAdminSidebar;
