import { useState, useEffect } from 'react';
import InputField from '../common/InputField';
import icons from '../common/icons';
import { defaultAliasFromEmail } from '../../domain/register/defaultAliasFromEmail';
import { generateTotpSecretStub } from '../../domain/register/generateTotpSecretStub';
import { verifyTotpCodeStub } from '../../domain/register/verifyTotpCodeStub';
import { BRANCHES } from '../../domain/branches/branches';

function RegisterProfilePasswordStep({ formData, errors, onFieldChange, detectedRole, detectedRoleLabel, onNext, onBack, totpSecret, onTotpSecret }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [totpError, setTotpError] = useState('');

  const handleTotpChange = (value) => {
    const normalized = String(value).replace(/\D/g, '').slice(0, 6);
    onFieldChange('totpCode', normalized);
    if (totpError) {
      setTotpError('');
    }
  };

  useEffect(() => {
    if (!formData.alias && formData.email) {
      onFieldChange('alias', defaultAliasFromEmail(formData.email));
    }
  }, [formData.email, formData.alias, onFieldChange]);

  useEffect(() => {
    if (!totpSecret) {
      onTotpSecret(generateTotpSecretStub());
    }
  }, [totpSecret, onTotpSecret]);

  const handleNext = () => {
    if (!/^\d{6}$/.test(formData.totpCode || '')) {
      setTotpError('Code must be exactly 6 digits.');
      return;
    }
    if (!verifyTotpCodeStub(formData.totpCode)) {
      setTotpError('Enter the 6-digit code from your authenticator app. Demo: use 000000 after saving the secret.');
      return;
    }
    setTotpError('');
    onNext();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleNext();
  };

  return (
    <form className="register-step" onSubmit={handleSubmit}>
      <h3 className="register-step-title">Profile &amp; security</h3>
      <p className="register-step-desc">Alias, password, and rolling passcode (TOTP).</p>

      <div className="form-row">
        <InputField
          label="First name"
          type="text"
          placeholder="First name"
          value={formData.firstName}
          onChange={(value) => onFieldChange('firstName', value)}
          error={errors.firstName}
          required
        />
        <InputField
          label="Last name"
          type="text"
          placeholder="Last name"
          value={formData.lastName}
          onChange={(value) => onFieldChange('lastName', value)}
          error={errors.lastName}
          required
        />
      </div>

      <InputField
        label="Preferred alias (sign-in name)"
        type="text"
        placeholder="Defaults to email before @"
        value={formData.alias}
        onChange={(value) => onFieldChange('alias', value)}
        error={errors.alias}
        required
      />

      {detectedRole !== 'customer' && (
        <div className="register-role-inline">
          Detected account type: <strong>{detectedRoleLabel}</strong>
        </div>
      )}

      {detectedRole !== 'customer' && (
        <div className="input-group">
          <label>Branch <span className="required-star">*</span></label>
          <select
            value={formData.branch || ''}
            onChange={(event) => onFieldChange('branch', event.target.value)}
            className={errors.branch ? 'input-error' : ''}
            required
          >
            <option value="">Select your branch</option>
            {BRANCHES.map((branchName) => (
              <option key={branchName} value={branchName}>
                {branchName}
              </option>
            ))}
          </select>
          {errors.branch && (
            <div className="error-message">
              <img src={icons.diamondExclamation} alt="" className="inline-icon" />
              <span>{errors.branch}</span>
            </div>
          )}
        </div>
      )}

      <div className="input-group">
        <label>Password <span className="required-star">*</span></label>
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => onFieldChange('password', e.target.value)}
            className={errors.password ? 'input-error' : ''}
          />
          <button type="button" className="toggle-password-btn" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.password && (
          <div className="error-message">
            <img src={icons.diamondExclamation} alt="" className="inline-icon" />
            <span>{errors.password}</span>
          </div>
        )}
      </div>

      <div className="input-group">
        <label>Confirm password <span className="required-star">*</span></label>
        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={(e) => onFieldChange('confirmPassword', e.target.value)}
            className={errors.confirmPassword ? 'input-error' : ''}
          />
          <button type="button" className="toggle-password-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.confirmPassword && (
          <div className="error-message">
            <img src={icons.diamondExclamation} alt="" className="inline-icon" />
            <span>{errors.confirmPassword}</span>
          </div>
        )}
      </div>

      <div className="register-totp-box">
        <p><strong>Set up rolling passcode (TOTP)</strong></p>
        <p className="register-step-desc">Add this secret to Google Authenticator or similar, then enter a 6-digit code.</p>
        <code className="register-totp-secret">{totpSecret || '…'}</code>
        <div className="input-group" style={{ marginTop: 12 }}>
          <label>Authenticator code</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="6 digits (demo: 000000)"
            value={formData.totpCode}
            onChange={(e) => handleTotpChange(e.target.value)}
            maxLength={6}
          />
        </div>
        {totpError && (
          <div className="error-message">
            <img src={icons.diamondExclamation} alt="" className="inline-icon" />
            <span>{totpError}</span>
          </div>
        )}
      </div>

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

export default RegisterProfilePasswordStep;
