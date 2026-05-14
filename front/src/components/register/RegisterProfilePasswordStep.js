import { useState, useEffect } from 'react';
import InputField from '../common/InputField';
import icons from '../common/icons';
import { defaultAliasFromEmail } from '../../domain/register/defaultAliasFromEmail';
import { BRANCHES } from '../../domain/branches/branches';

function RegisterProfilePasswordStep({ formData, errors, onFieldChange, detectedRole, detectedRoleLabel, onNext, onBack }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!formData.alias && formData.email) {
      onFieldChange('alias', defaultAliasFromEmail(formData.email));
    }
  }, [formData.email, formData.alias, onFieldChange]);

  const handleNext = () => {
    onNext();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleNext();
  };

  return (
    <form className="register-step" onSubmit={handleSubmit}>
      <h3 className="register-step-title">Profile &amp; security</h3>
      <p className="register-step-desc">Set your alias and a strong password.</p>

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
        <div className="password-hint">
          Password must be at least 8 characters, including uppercase, lowercase, number, and special character (@$!%*?&)
        </div>
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
