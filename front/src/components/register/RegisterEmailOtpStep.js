import { useState } from 'react';
import InputField from '../common/InputField';
import icons from '../common/icons';

function RegisterEmailOtpStep({ formData, errors, onFieldChange, detectedRole, detectedRoleLabel, onNext, onBack }) {
  const [localError, setLocalError] = useState('');

  const continueNext = () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError('Enter a valid email address.');
      return;
    }
    setLocalError('');
    onNext();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    continueNext();
  };

  return (
    <form className="register-step" onSubmit={handleSubmit}>
      <h3 className="register-step-title">Email</h3>
      <p className="register-step-desc">Email verification is disabled for this demo.</p>

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

      {localError && (
        <div className="error-message">
          <img src={icons.diamondExclamation} alt="" className="inline-icon" />
          <span>{localError}</span>
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
