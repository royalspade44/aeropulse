import { useState } from 'react';

function AddUnitModal({ onClose, onSave }) {
  const [unit, setUnit] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    installationDate: '',
    status: 'Good',
    notes: ''
  });

  const handleSubmit = () => {
    if (!unit.brand || !unit.model || !unit.serialNumber || !unit.installationDate) {
      alert('Please fill in all required fields');
      return;
    }
    onSave({ ...unit, id: Date.now(), serviceHistory: [] });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="unit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New AC Unit</h3>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Brand *</label>
            <input
              type="text"
              placeholder="e.g., Daikin, LG, Panasonic"
              value={unit.brand}
              onChange={(e) => setUnit({ ...unit, brand: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Model *</label>
            <input
              type="text"
              placeholder="e.g., FTKS25, LS-Q12"
              value={unit.model}
              onChange={(e) => setUnit({ ...unit, model: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Serial Number *</label>
            <input
              type="text"
              placeholder="Serial number on your AC unit"
              value={unit.serialNumber}
              onChange={(e) => setUnit({ ...unit, serialNumber: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Installation Date *</label>
            <input
              type="date"
              value={unit.installationDate}
              onChange={(e) => setUnit({ ...unit, installationDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <div className="status-options">
              <label className="status-option">
                <input
                  type="radio"
                  name="status"
                  value="Good"
                  checked={unit.status === 'Good'}
                  onChange={(e) => setUnit({ ...unit, status: e.target.value })}
                />
                <span>Good</span>
              </label>
              <label className="status-option">
                <input
                  type="radio"
                  name="status"
                  value="Needs Service"
                  checked={unit.status === 'Needs Service'}
                  onChange={(e) => setUnit({ ...unit, status: e.target.value })}
                />
                <span>Needs Service</span>
              </label>
              <label className="status-option">
                <input
                  type="radio"
                  name="status"
                  value="Critical"
                  checked={unit.status === 'Critical'}
                  onChange={(e) => setUnit({ ...unit, status: e.target.value })}
                />
                <span>Critical</span>
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Additional Notes (Optional)</label>
            <textarea
              rows="3"
              placeholder="Any additional information about this unit"
              value={unit.notes}
              onChange={(e) => setUnit({ ...unit, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="confirm-btn" onClick={handleSubmit}>Add Unit</button>
        </div>
      </div>
    </div>
  );
}

export default AddUnitModal;