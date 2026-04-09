import React from 'react';
import { useUser } from '../../../context/UserContext';

const TechHeader = ({ title = 'Technician', subtitle = 'Field operations', onMenuToggle }) => {
  const { user } = useUser();

  return (
    <header className="tech-header">
      <div className="tech-header-left">
        <button type="button" className="tech-menu-toggle" onClick={onMenuToggle}>
          ☰
        </button>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="tech-user-chip">
        <span className="tech-user-avatar">{(user?.name || 'T').charAt(0).toUpperCase()}</span>
        <span>{user?.name || 'Technician'}</span>
      </div>
    </header>
  );
};

export default TechHeader;
