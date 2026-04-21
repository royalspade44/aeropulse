import React from 'react';
import './ServiceRequests.css';

const ServiceRequests = ({ requests, onSelect }) => {
  return (
    <div className="admin-card">
      <h3>Service Requests</h3>
      {requests.map((request) => (
        <button key={request.id} className="admin-list-item" onClick={() => onSelect(request)}>
          <strong>{request.customer}</strong>
          <span>{request.issue}</span>
          <span>{request.status}</span>
        </button>
      ))}
    </div>
  );
};

export default ServiceRequests;
