import { useState } from 'react';
import InputField from '../common/InputField';
import icons from '../common/icons';
import { verifyEmailOtpStub } from '../../domain/register/emailOtpStub';

function RegisterEmailOtpStep({ formData, errors, onFieldChange, detectedRole, detectedRoleLabel, onNext, onBack }) {
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleEmailOtpChange = (value) => {
    const normalized = String(value).replace(/\D/g, '').slice(0, 6);
    onFieldChange('emailOtp', normalized);
    if (localError) {
      setLocalError('');
    }
  };

  const sendOtp = () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError('Enter a valid email first.');
      return;
    }
    setLocalError('');
    setEmailOtpSent(true);
    alert('Demo: a one-time code was sent to your email. Use 123456.');
  };

  const verifyAndNext = () => {
    if (!/^\d{6}$/.test(formData.emailOtp || '')) {
      setLocalError('Code must be exactly 6 digits.');
      return;
    }
    if (!verifyEmailOtpStub(formData.email, formData.emailOtp)) {
      setLocalError('Invalid code. Demo code is 123456.');
      return;
    }
    setLocalError('');
    onNext();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyAndNext();
  };

  return (
    <form className="register-step" onSubmit={handleSubmit}>
      <h3 className="register-step-title">Verify email</h3>
      <p className="register-step-desc">We will send a one-time code to confirm your address.</p>

      <InputField
        label="Email address"
        type="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={(value) => onFieldChange('email', value)}
        error={errors.email}
        required
      />

      {detectedRole !== 'customer' && (
        <div className="register-role-inline">
          Detected account type: <strong>{detectedRoleLabel}</strong>
        </div>
      )}

      <button type="button" className="cancel-btn" style={{ marginBottom: 12 }} onClick={sendOtp}>
        {emailOtpSent ? 'Resend code' : 'Send one-time code'}
      </button>

      <div className="input-group">
        <label>One-time code <span className="required-star">*</span></label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6-digit code"
          value={formData.emailOtp}
          onChange={(e) => handleEmailOtpChange(e.target.value)}
          maxLength={6}
        />
      </div>

      {(localError || errors.emailOtp) && (
        <div className="error-message">
          <img src={icons.diamondExclamation} alt="" className="inline-icon" />
          <span>{localError || errors.emailOtp}</span>
        </div>
      )}

      <div className="register-step-actions">
        <button type="button" className="cancel-btn" onClick={onBack}>
          Back
        </button>
        <button type="submit" className="register-button">
          Continue
        </button>
      </div>
    </form>
  );
}

export default RegisterEmailOtpStep;
