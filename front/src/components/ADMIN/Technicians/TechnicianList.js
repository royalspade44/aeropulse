import React from 'react';
import './styles.css';

const TechnicianList = ({ technicians, onSelect }) => {
  return (
    <div className="admin-card">
      <h3>Technician List</h3>
      {technicians.map((tech) => (
        <button key={tech.id} className="admin-list-item" onClick={() => onSelect(tech)}>
          <strong>{tech.name}</strong>
          <span>{tech.specialty}</span>
          <span>{tech.status}</span>
        </button>
      ))}
    </div>
  );
};

export default TechnicianList;
