import React from 'react';
import { useUser } from '../../../context/UserContext';
import icons from '../../common/icons';

const TechHeader = ({ title = 'Technician Workspace', subtitle = 'Field operations', onMenuToggle }) => {
  const { user } = useUser();

  return (
    <header className="tech-header">
      <div className="tech-header-left">
        <button type="button" className="tech-menu-toggle" onClick={onMenuToggle}>
          <img src={icons.customize} alt="" className="inline-icon inline-icon--md" />
        </button>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="tech-user-chip">
        <span className="tech-user-avatar">{(user?.name?.charAt(0) || '?').toUpperCase()}</span>
        <span>{user?.name || '-'}</span>
      </div>
    </header>
  );
};

export default TechHeader;
