import { useState } from 'react';
import icons from '../common/icons';

function ReportIssueModal({ unit, user, onSubmit, onClose }) {
  const [issueType, setIssueType] = useState('Poor cooling');
  const [issueDescription, setIssueDescription] = useState('');
  const [address, setAddress] = useState(user?.address || user?.billingAddress?.street || '');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!issueDescription.trim() || !address.trim()) {
      alert('Please provide issue details and service address.');
      return;
    }

    setBusy(true);
    try {
      await onSubmit({ issueType, issueDescription, address });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="unit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Report an Issue</h3>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <img src={icons.temperatureFrigid} alt="Report" style={{ width: 50, height: 50 }} />
            <p style={{ marginTop: 16, color: '#4b5563' }}>
              Report an issue for <strong>{unit.brand} {unit.model}</strong>
            </p>
          </div>

          <div className="form-group">
            <label>Issue type</label>
            <select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
              <option>Poor cooling</option>
              <option>Strange noise</option>
              <option>Water leak</option>
              <option>Bad odor</option>
              <option>Electrical issue</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Issue details</label>
            <textarea
              rows="5"
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Describe what the unit is doing, when it started, and any symptoms."
            />
          </div>

          <div className="form-group">
            <label>Service address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter installation or service address"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="confirm-btn" disabled={busy}>
              {busy ? 'Reporting…' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportIssueModal;
