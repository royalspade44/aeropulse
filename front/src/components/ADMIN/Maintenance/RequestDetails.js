import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../config/api';

const RequestDetails = ({ request }) => {
  const [current, setCurrent] = useState(request);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setCurrent(request);
    setMessage('');
  }, [request]);

  const updateRequest = async (payload, successText) => {
    if (!current?.id) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await apiRequest(`/service-requests/${current.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setCurrent(result.request);
      setMessage(successText);
    } catch (error) {
      setMessage(error?.message || 'Request update failed.');
    } finally {
      setBusy(false);
    }
  };

  const markCompleted = () => {
    updateRequest({ status: 'Completed' }, 'Request marked completed.');
  };

  if (!current) {
    return (
      <div className="admin-card">
        <h3>Request Details</h3>
        <p>Select a request to view full details.</p>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <h3>Request #{current.id}</h3>
      <p><strong>Customer:</strong> {current.customer}</p>
      <p><strong>Unit:</strong> {current.unitName || 'N/A'}</p>
      <p><strong>Issue:</strong> {current.issue}</p>
      <p><strong>Address:</strong> {current.address}</p>
      <p><strong>Status:</strong> {current.status}</p>
      {current.assignedTechnicianName ? (
        <p><strong>Assigned Technician:</strong> {current.assignedTechnicianName}</p>
      ) : (
        <p><strong>Assigned Technician:</strong> <span style={{ color: '#9ca3af' }}>Waiting for technician to accept...</span></p>
      )}

      <div style={{ marginTop: 18 }}>
        <button type="button" onClick={markCompleted} disabled={busy} style={{ 
          padding: '10px 20px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 700
        }}>
          {busy ? 'Saving…' : 'Mark Completed'}
        </button>
      </div>

      {message ? <p style={{ marginTop: 12, color: '#1f2937', fontWeight: 600 }}>{message}</p> : null}
    </div>
  );
};

export default RequestDetails;
