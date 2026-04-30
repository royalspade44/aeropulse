import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { confirmDialog } from '../../../utils/dialog';
import icons from '../../common/icons';
import './styles.css';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: icons.clipboardList },
  { to: '/admin/analytics', label: 'Analytics', icon: icons.clipboardList },
  { to: '/admin/inventory', label: 'Inventory', icon: icons.boxOpen },
  { to: '/admin/maintenance', label: 'Maintenance', icon: icons.tools },
  { to: '/admin/technicians', label: 'Technicians', icon: icons.memberList },
  { to: '/admin/attendance', label: 'Attendance', icon: icons.visit },
  { to: '/admin/orders', label: 'Orders', icon: icons.clipboardList },
  { to: '/admin/store', label: 'Store', icon: icons.houseChimney },
  { to: '/admin/unlock-users', label: 'Unlock Users', icon: icons.lock },
  { to: '/admin/reorder', label: 'Reorder', icon: icons.cartShoppingFast },
  { to: '/admin/profile', label: 'Profile', icon: icons.memberList }
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
          <span className="brand-icon">
            <img src={icons.globePointer} alt="" className="inline-icon inline-icon--md" />
          </span>
          <span>AeroPulse</span>
        </div>
        <button className="admin-sidebar-close" onClick={onClose} type="button" aria-label="Close menu">
          {'\u2715'}
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
            <span className="nav-icon">
              <img src={item.icon} alt="" className="inline-icon inline-icon--md" />
            </span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-sidebar-logout" onClick={handleLogout} type="button">
          <span>
            <img src={icons.signOutAlt} alt="" className="inline-icon inline-icon--md" />
          </span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
