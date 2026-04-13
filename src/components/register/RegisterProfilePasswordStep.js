import { useState, useEffect } from 'react';
import InputField from '../common/InputField';
import icons from '../common/icons';
import RoleSelector from '../login/RoleSelector';
import { defaultAliasFromEmail } from '../../domain/register/defaultAliasFromEmail';
import { generateTotpSecretStub } from '../../domain/register/generateTotpSecretStub';
import { verifyTotpCodeStub } from '../../domain/register/verifyTotpCodeStub';

const REGISTER_ROLES = [
  { id: 'customer', label: 'Customer', iconSrc: icons.memberList },
  { id: 'technician', label: 'Technician', iconSrc: icons.tools }
];

function RegisterProfilePasswordStep({ formData, errors, onFieldChange, onNext, onBack, totpSecret, onTotpSecret }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [totpError, setTotpError] = useState('');

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

  const selectedRole = REGISTER_ROLES.find((r) => r.id === formData.role) || REGISTER_ROLES[0];

  const handleNext = () => {
    if (!verifyTotpCodeStub(totpCode)) {
      setTotpError('Enter the 6-digit code from your authenticator app. Demo: use 000000 after saving the secret.');
      return;
    }
    setTotpError('');
    onNext();
  };

  return (
    <div className="register-step">
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

      <RoleSelector
        selectedRole={selectedRole}
        roles={REGISTER_ROLES}
        onRoleChange={(roleId) => onFieldChange('role', roleId)}
        disabled={false}
      />

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
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
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
        <button type="button" className="register-button" onClick={handleNext}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default RegisterProfilePasswordStep;
