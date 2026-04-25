import { useState } from 'react';
import InputField from '../common/InputField';
import icons from '../common/icons';
import { canSendSmsOtp, recordSmsOtpAttempt } from '../../domain/register/smsOtpRateLimiter';

function RegisterPhoneOtpStep({ formData, errors, onFieldChange, detectedRole, onSubmit, onBack, loading }) {
  const [localError, setLocalError] = useState('');
  const isCustomer = detectedRole === 'customer';

  const isValidPhone = (value) => /^(09\d{9}|639\d{9})$/.test(String(value || '').replace(/\D/g, ''));

  const handlePhoneChange = (value) => {
    const normalized = String(value).replace(/\D/g, '').slice(0, 12);
    onFieldChange('phone', normalized);
    if (localError) {
      setLocalError('');
    }
  };

  const handleSmsCodeChange = (value) => {
    const normalized = String(value).replace(/\D/g, '').slice(0, 6);
    onFieldChange('smsCode', normalized);
    if (localError) {
      setLocalError('');
    }
  };

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
    if (!isValidPhone(formData.phone)) {
      setLocalError('Enter a valid PH mobile number (09XXXXXXXXX or 639XXXXXXXXX).');
      return;
    }
    if (isCustomer && !String(formData.address || '').trim()) {
      setLocalError('Billing address is required for customer accounts.');
      return;
    }
    if (!/^\d{6}$/.test(formData.smsCode || '')) {
      setLocalError('Code must be exactly 6 digits.');
      return;
    }

    console.log('[Register][Step4] Submitting final step', {
      hasPhone: Boolean(formData.phone),
      smsCodeLength: String(formData.smsCode || '').length,
      detectedRole,
      isCustomer,
    });

    setLocalError('');
    onSubmit();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCreate();
  };

  return (
    <form className="register-step" onSubmit={handleSubmit}>
      <h3 className="register-step-title">Mobile number</h3>
      <p className="register-step-desc">PH mobile; carrier confirmation allows 2 SMS sends per hour (demo).</p>

      <InputField
        label="Phone number"
        type="tel"
        placeholder="09xx or 639xx"
        value={formData.phone}
        onChange={handlePhoneChange}
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
          value={formData.smsCode}
          onChange={(e) => handleSmsCodeChange(e.target.value)}
          maxLength={6}
        />
      </div>

      {(localError || errors.phoneOtp) && (
        <div className="error-message">
          <img src={icons.diamondExclamation} alt="" className="inline-icon" />
          <span>{localError || errors.phoneOtp}</span>
        </div>
      )}

      {isCustomer && (
        <InputField
          label="Billing address"
          type="text"
          placeholder="Street, city, province"
          value={formData.address}
          onChange={(value) => onFieldChange('address', value)}
          error={errors.address}
          required
        />
      )}

      <div className="register-step-actions">
        <button type="button" className="cancel-btn" onClick={onBack} disabled={loading}>
          Back
        </button>
        <button type="submit" className="register-button" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </div>
    </form>
  );
}

export default RegisterPhoneOtpStep;
