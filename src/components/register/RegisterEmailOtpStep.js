import { useState } from 'react';
import InputField from '../common/InputField';
import icons from '../common/icons';
import { verifyEmailOtpStub } from '../../domain/register/emailOtpStub';

function RegisterEmailOtpStep({ formData, errors, onFieldChange, onNext, onBack }) {
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [localError, setLocalError] = useState('');

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
    if (!verifyEmailOtpStub(formData.email, emailOtp)) {
      setLocalError('Invalid code. Demo code is 123456.');
      return;
    }
    setLocalError('');
    onNext();
  };

  return (
    <div className="register-step">
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
          value={emailOtp}
          onChange={(e) => setEmailOtp(e.target.value)}
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
        <button type="button" className="register-button" onClick={verifyAndNext}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default RegisterEmailOtpStep;
