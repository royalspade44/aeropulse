import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../config/api';

const RequestDetails = ({ request }) => {
  const [current, setCurrent] = useState(request);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setCurrent(request);
    setSelectedTechId(request?.assignedTechnicianId || '');
    setMessage('');
  }, [request]);

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const result = await apiRequest('/users?role=technician');
        setTechnicians(result.users || []);
      } catch (error) {
        setTechnicians([]);
      }
    };

    loadTechnicians();
  }, []);

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

  const assignTechnician = () => {
    const tech = technicians.find((techUser) => techUser.id === selectedTechId);
    if (!tech) {
      setMessage('Please select a technician to assign.');
      return;
    }
    updateRequest(
      {
        status: 'Assigned',
        assignedTechnicianId: tech.id,
        assignedTechnicianName: tech.name || tech.email || 'Technician',
      },
      `Assigned to ${tech.name || tech.email}.`
    );
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
        <p><strong>Technician:</strong> {current.assignedTechnicianName}</p>
      ) : null}

      <div style={{ marginTop: 18 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Assign technician</label>
        <select
          value={selectedTechId}
          onChange={(e) => setSelectedTechId(e.target.value)}
          disabled={busy}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 12 }}
        >
          <option value="">Select technician</option>
          {technicians.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.name || tech.email}
            </option>
          ))}
        </select>
        <button type="button" onClick={assignTechnician} disabled={busy || !selectedTechId} style={{ marginRight: 10 }}>
          {busy ? 'Saving…' : 'Assign Technician'}
        </button>
        <button type="button" onClick={markCompleted} disabled={busy}>
          Mark Completed
        </button>
      </div>

      {message ? <p style={{ marginTop: 12, color: '#1f2937', fontWeight: 600 }}>{message}</p> : null}
    </div>
  );
};

export default RequestDetails;
