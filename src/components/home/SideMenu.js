import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

function SideMenu({ isOpen, onClose, activePage, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState(activePage);

  const menuItems = useMemo(() => ([
    { id: 'myunit', label: 'My Unit', icon: '❄️', path: '/myunit', description: 'Manage your AC units' },
    { id: 'services', label: 'Services', icon: '🔧', path: '/services', description: 'Book maintenance & repair' },
    { id: 'shop', label: 'Shop', icon: '🛒', path: '/shop', description: 'Browse AC products' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings', description: 'Account preferences' },
    { id: 'contact', label: 'Contact', icon: '📞', path: '/contact', description: 'Get in touch with us' },
  ]), []);

  // Update active menu item based on current path
  useEffect(() => {
    const menuItem = menuItems.find(item => item.path === location.pathname);
    if (menuItem) {
      setActiveMenuItem(menuItem.id);
    }
  }, [location.pathname, menuItems]);

  // Get user's display name
  const getUserDisplayName = () => {
    if (!user) return 'Guest User';
    
    // Check for different name formats in user object
    if (user.name) return user.name;
    if (user.name_first && user.name_last) return `${user.name_first} ${user.name_last}`;
    if (user.name_first) return user.name_first;
    if (user.email) return user.email.split('@')[0];
    
    return 'Cold Air Customer';
  };

  // Get user's role/type
  const getUserRole = () => {
    if (!user) return 'Guest';
    if (user.role) return user.role === 'technician' ? 'Technician' : 'Customer';
    if (user.isGoogleAccount) return 'Google User';
    return 'Customer';
  };

  // Get user avatar initial
  const getUserInitial = () => {
    const name = getUserDisplayName();
    if (name && name !== 'Guest User') {
      return name.charAt(0).toUpperCase();
    }
    return '👤';
  };

  const handleNavigation = (path, itemId) => {
    setActiveMenuItem(itemId);
    navigate(path);
    onClose();
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setShowLogoutModal(false);
    onClose();
    navigate('/login', { replace: true });
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div className="side-menu-backdrop" onClick={onClose}>
        <div className="backdrop-blur"></div>
      </div>

      {/* Side Menu Panel */}
      <div className={`side-menu ${isOpen ? 'open' : ''}`}>
        {/* Menu Header with user info */}
        <div className="menu-header">
          <div className="menu-header-content">
            <div className="user-avatar">
              {getUserInitial() === '👤' ? (
                <span>👤</span>
              ) : (
                <span className="user-initial">{getUserInitial()}</span>
              )}
            </div>
            <div className="user-info">
              <h3>Welcome Back,</h3>
              <p className="user-name">{getUserDisplayName()}</p>
              <span className="user-role">{getUserRole()}</span>
            </div>
          </div>
          <button className="close-menu" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Menu Navigation */}
        <div className="menu-nav">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`menu-item ${activeMenuItem === item.id ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path, item.id)}
            >
              <div className="menu-icon-wrapper">
                <span className="menu-icon">{item.icon}</span>
              </div>
              <div className="menu-item-content">
                <span className="menu-label">{item.label}</span>
                <span className="menu-description">{item.description}</span>
              </div>
              {activeMenuItem === item.id && (
                <div className="active-indicator"></div>
              )}
            </div>
          ))}
          
          {/* Divider */}
          <div className="menu-divider"></div>
          
          {/* Logout Item */}
          <div className="menu-item logout-item" onClick={handleLogoutClick}>
            <div className="menu-icon-wrapper">
              <span className="menu-icon">🚪</span>
            </div>
            <div className="menu-item-content">
              <span className="menu-label">Logout</span>
              <span className="menu-description">Sign out of your account</span>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="menu-footer">
          <div className="version-info">
            <span>Version 1.0.0</span>
            <span>© Cold Air</span>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={handleCancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-header">
              <div className="logout-icon-wrapper">
                <div className="logout-icon">🚪</div>
              </div>
              <h3>Logout Confirmation</h3>
              <p>Are you sure you want to log out?</p>
            </div>
            <div className="logout-modal-body">
              <div className="warning-message">
                <span className="warning-icon">⚠️</span>
                <span>You will need to login again to access your account.</span>
              </div>
            </div>
            <div className="logout-modal-footer">
              <button className="logout-cancel-btn" onClick={handleCancelLogout}>
                Cancel
              </button>
              <button className="logout-confirm-btn" onClick={handleConfirmLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SideMenu;