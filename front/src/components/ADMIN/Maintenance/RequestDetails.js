import React from 'react';

const RequestDetails = ({ request }) => {
  if (!request) {
    return (
      <div className="admin-card">
        <h3>Request Details</h3>
        <p>Select a request to view full details.</p>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <h3>Request #{request.id}</h3>
      <p><strong>Customer:</strong> {request.customer}</p>
      <p><strong>Issue:</strong> {request.issue}</p>
      <p><strong>Address:</strong> {request.address}</p>
      <p><strong>Status:</strong> {request.status}</p>
    </div>
  );
};

export default RequestDetails;
