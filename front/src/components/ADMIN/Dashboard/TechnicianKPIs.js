import React from 'react';
import icons from '../../common/icons';

/**
 * TechnicianKPIs - Display technician performance metrics
 */
const TechnicianKPIs = ({ technicians = [] }) => {
  if (!technicians || technicians.length === 0) {
    return (
      <div className="technician-kpis">
        <p>No technician data available</p>
      </div>
    );
  }

  return (
    <div className="technician-kpis">
      <div className="kpi-table">
        <div className="kpi-header">
          <div className="kpi-col kpi-name">Technician</div>
          <div className="kpi-col kpi-today">Today</div>
          <div className="kpi-col kpi-week">This Week</div>
          <div className="kpi-col kpi-month">This Month</div>
        </div>
        {technicians.slice(0, 8).map((tech, index) => (
          <div key={index} className="kpi-row">
            <div className="kpi-col kpi-name">
              <span className="tech-avatar">{tech.name?.charAt(0).toUpperCase()}</span>
              <span>{tech.name}</span>
            </div>
            <div className="kpi-col kpi-today">
              <span className="kpi-badge">{tech.completedToday || 0}</span>
            </div>
            <div className="kpi-col kpi-week">
              <span className="kpi-badge kpi-badge-info">{tech.completedWeek || 0}</span>
            </div>
            <div className="kpi-col kpi-month">
              <span className="kpi-badge kpi-badge-success">{tech.completedMonth || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicianKPIs;
