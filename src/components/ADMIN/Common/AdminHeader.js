import React from 'react';
import { useUser } from '../../../context/UserContext';
import icons from '../../common/icons';
import './AdminHeader.css';

const AdminHeader = ({ title = 'Admin Module', subtitle = 'Control panel', onMenuToggle }) => {
  const { user } = useUser();

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button className="admin-menu-toggle" onClick={onMenuToggle} type="button">
          <img src={icons.customize} alt="" className="inline-icon inline-icon--md" />
        </button>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="admin-header-user">
        <span className="admin-user-avatar">
          {(user?.name || 'Admin').charAt(0).toUpperCase()}
        </span>
        <span>{user?.name || 'Administrator'}</span>
      </div>
    </header>
  );
};

export default AdminHeader;
