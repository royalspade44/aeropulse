import { getWarrantyWarnings } from '../../domain/myunit/warrantyWarnings';

function WarrantyStatusModal({ unit, onClose }) {
  const warnings = getWarrantyWarnings(unit);
  const valid = !unit?.warrantyRevoked && !unit?.recallActive;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="unit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Warranty — {unit.brand} {unit.model}</h3>
          <button type="button" className="close-modal" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="info-row">
            <span className="info-label">Validity</span>
            <span className="info-value">{valid ? 'Active (demo)' : 'Limited / revoked'}</span>
          </div>
          {warnings.length > 0 && (
            <div className="warranty-warnings" role="alert">
              {warnings.map((w) => (
                <p key={w}>{w}</p>
              ))}
            </div>
          )}
          <div className="info-row">
            <span className="info-label">Coverage</span>
            <span className="info-value">{unit.warrantyTerms || 'As agreed at sign-up (see Terms — warranty).'}</span>
          </div>
          <p className="warranty-footnote">
            Owner-configured thresholds (e.g. failed repairs in a period) apply in production; this screen reads unit flags set by admin or technician tickets.
          </p>
        </div>
        <div className="modal-footer">
          <button type="button" className="confirm-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default WarrantyStatusModal;
