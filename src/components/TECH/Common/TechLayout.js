import React, { useState } from 'react';
import TechHeader from './TechHeader';
import TechSidebar from './TechSidebar';
import '../techShared.css';

const TechLayout = ({ title, subtitle, children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="tech-layout">
      <TechSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="tech-layout-main">
        <TechHeader title={title} subtitle={subtitle} onMenuToggle={() => setMenuOpen((open) => !open)} />
        {children}
      </div>
      {menuOpen && <div className="tech-menu-overlay" onClick={() => setMenuOpen(false)} />}
    </div>
  );
};

export default TechLayout;
