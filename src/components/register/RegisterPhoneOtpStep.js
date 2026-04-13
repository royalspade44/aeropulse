import { useState } from 'react';
import InputField from '../common/InputField';
import icons from '../common/icons';
import { canSendSmsOtp, recordSmsOtpAttempt } from '../../domain/register/smsOtpRateLimiter';
import { verifySmsOtpStub } from '../../domain/register/smsOtpStub';

function RegisterPhoneOtpStep({ formData, errors, onFieldChange, onSubmit, onBack, loading }) {
  const [smsCode, setSmsCode] = useState('');
  const [localError, setLocalError] = useState('');

  const sendSms = () => {
    const gate = canSendSmsOtp();
    if (!gate.allowed) {
      const mins = Math.ceil((gate.retryAfterMs || 0) / 60000);
      setLocalError(`Carrier limit: 2 SMS attempts per hour. Retry in about ${mins} min.`);
      return;
    }
    recordSmsOtpAttempt();
    setLocalError('');
    alert('Demo: SMS sent. Use code 654321.');
  };

  const handleCreate = () => {
    if (!verifySmsOtpStub(smsCode)) {
      setLocalError('Invalid SMS code. Demo: 654321');
      return;
    }
    setLocalError('');
    onSubmit();
  };

  return (
    <div className="register-step">
      <h3 className="register-step-title">Mobile number</h3>
      <p className="register-step-desc">PH mobile; carrier confirmation allows 2 SMS sends per hour (demo).</p>

      <InputField
        label="Phone number"
        type="tel"
        placeholder="09xx or 639xx"
        value={formData.phone}
        onChange={(value) => onFieldChange('phone', value)}
        error={errors.phone}
        required
      />

      <button type="button" className="cancel-btn" style={{ marginBottom: 12 }} onClick={sendSms}>
        Send SMS one-time code
      </button>

      <div className="input-group">
        <label>SMS code</label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="6-digit code"
          value={smsCode}
          onChange={(e) => setSmsCode(e.target.value)}
        />
      </div>

      {(localError || errors.phoneOtp) && (
        <div className="error-message">
          <img src={icons.diamondExclamation} alt="" className="inline-icon" />
          <span>{localError || errors.phoneOtp}</span>
        </div>
      )}

      <InputField
        label="Address (billing / shipping)"
        type="text"
        placeholder="Street, city, province"
        value={formData.address}
        onChange={(value) => onFieldChange('address', value)}
        error={errors.address}
      />

      <div className="register-step-actions">
        <button type="button" className="cancel-btn" onClick={onBack} disabled={loading}>
          Back
        </button>
        <button type="button" className="register-button" onClick={handleCreate} disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </div>
    </div>
  );
}

export default RegisterPhoneOtpStep;
