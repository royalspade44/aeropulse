import { useState } from 'react';
import { parseQrInstallPayload } from '../../domain/myunit/parseQrInstallPayload';
import { estimateNextServiceWindow } from '../../domain/myunit/ampereNextService';

function buildUnitFromQrPayload(data) {
  const serial = data.serialNumber || data.serial;
  const conditionRating = data.conditionRating || 'good';
  const lastServiceDate = data.lastServiceDate || new Date().toISOString();
  const ampere = estimateNextServiceWindow({ conditionRating, lastServiceDate });

  return {
    id: Date.now(),
    brand: data.brand || 'Unknown',
    model: data.model || '—',
    serialNumber: serial,
    installationDate: data.installationDate || new Date().toISOString().split('T')[0],
    status: data.status || 'Good',
    notes: data.notes || '',
    warrantyTerms: data.warrantyTerms || 'Standard warranty terms from sign-up apply.',
    serviceHistory: [],
    lastTechnicianCondition: conditionRating,
    installEnvironmentNotes: data.installFactors || data.installEnvironment || '',
    technicianReportSummary: data.reportSummary || '',
    ampereNextServiceLabel: ampere.label,
    recommendedReplacement: !!data.recommendedReplacement,
    failedRepairsCount: data.failedRepairsCount ?? 0,
    failedRepairsThreshold: data.failedRepairsThreshold ?? 3,
    recallActive: !!data.recallActive,
    warrantyRevoked: !!data.warrantyRevoked
  };
}

function RegisterQrUnitModal({ onClose, onRegister }) {
  const [raw, setRaw] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const demoPayload = () => {
    const sample = {
      serialNumber: `QR-${Date.now().toString(36).toUpperCase()}`,
      brand: 'Demo Brand',
      model: 'Split 1.5HP',
      conditionRating: 'good',
      installFactors: 'dust exposure moderate, heat load normal',
      reportSummary: 'Post-install inspection OK; filters clean.'
    };
    setRaw(JSON.stringify(sample, null, 2));
    setError('');
    setPreview(buildUnitFromQrPayload(sample));
  };

  const parse = () => {
    const parsed = parseQrInstallPayload(raw);
    if (!parsed.ok) {
      setError(parsed.error);
      setPreview(null);
      return;
    }
    setError('');
    setPreview(buildUnitFromQrPayload(parsed.data));
  };

  const confirm = () => {
    let unitToSave = preview;
    if (!unitToSave) {
      const parsed = parseQrInstallPayload(raw);
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      unitToSave = buildUnitFromQrPayload(parsed.data);
    }
    onRegister(unitToSave);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="unit-modal register-qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Register unit from technician QR</h3>
          <button type="button" className="close-modal" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p className="register-qr-help">
            Paste the JSON payload from the technician&apos;s QR (demo). After registration, AMPERE shows the next ideal servicing window from the report.
          </p>
          <button type="button" className="cancel-btn" style={{ marginBottom: 10 }} onClick={demoPayload}>
            Load sample payload
          </button>
          <textarea
            className="register-qr-textarea"
            rows={8}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder='{"serialNumber":"SN…","brand":"…","model":"…","conditionRating":"good"}'
          />
          {error && <p className="error-inline">{error}</p>}
          <button type="button" className="cancel-btn" onClick={parse}>
            Parse &amp; preview
          </button>
          {preview && (
            <div className="register-qr-preview">
              <strong>Preview</strong>
              <p>
                {preview.brand} {preview.model} — S/N {preview.serialNumber}
              </p>
              <p>AMPERE next service: {preview.ampereNextServiceLabel}</p>
              {preview.installEnvironmentNotes && <p>Install environment: {preview.installEnvironmentNotes}</p>}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="confirm-btn" onClick={confirm} disabled={!raw.trim()}>
            Confirm &amp; register
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterQrUnitModal;
