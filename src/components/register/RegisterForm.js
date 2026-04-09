import { useState } from 'react';
import InputField from '../common/InputField';
import Button from '../common/Button';
import RoleSelector from '../login/RoleSelector';

function RegisterForm({
  formData,
  errors,
  onFieldChange,
  onSubmit,
  loading
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const roles = [
    { id: 'customer', label: 'Customer', icon: '👤' },
    { id: 'technician', label: 'Technician', icon: '🔧' }
  ];

  const selectedRole = roles.find(r => r.id === formData.role) || roles[0];

  const handleRoleChange = (roleId) => {
    onFieldChange('role', roleId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <InputField
          label="First Name"
          type="text"
          placeholder="Enter your first name"
          value={formData.firstName}
          onChange={(value) => onFieldChange('firstName', value)}
          error={errors.firstName}
          required
        />

        <InputField
          label="Last Name"
          type="text"
          placeholder="Enter your last name"
          value={formData.lastName}
          onChange={(value) => onFieldChange('lastName', value)}
          error={errors.lastName}
          required
        />
      </div>

      <InputField
        label="Email Address"
        type="email"
        placeholder="Enter your email address"
        value={formData.email}
        onChange={(value) => onFieldChange('email', value)}
        error={errors.email}
        required
      />

      <InputField
        label="Phone Number"
        type="tel"
        placeholder="Enter your phone number"
        value={formData.phone}
        onChange={(value) => onFieldChange('phone', value)}
        error={errors.phone}
        required
      />

      <RoleSelector
        selectedRole={selectedRole}
        roles={roles}
        onRoleChange={handleRoleChange}
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
          <button
            type="button"
            className="toggle-password-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.password && <div className="error-message">{errors.password}</div>}
        <div className="password-hint">
          Password must contain at least 8 characters, including uppercase, lowercase, number, and special character (@$!%*?&)
        </div>
      </div>

      <div className="input-group">
        <label>Confirm Password <span className="required-star">*</span></label>
        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => onFieldChange('confirmPassword', e.target.value)}
            className={errors.confirmPassword ? 'input-error' : ''}
          />
          <button
            type="button"
            className="toggle-password-btn"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
      </div>

      <div className="terms-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.agreeTerms}
            onChange={(e) => onFieldChange('agreeTerms', e.target.checked)}
          />
          <span>I agree to the <a href="/terms" target="_blank">Terms and Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a></span>
        </label>
        {errors.agreeTerms && <div className="error-message">{errors.agreeTerms}</div>}
      </div>

      <Button
        onClick={onSubmit}
        disabled={loading}
        className="register-button"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>

      <div className="divider">
        <span>or</span>
      </div>

      <div className="login-link">
        Already have an account? <button type="button" onClick={() => window.location.href = '/login'}>Sign in</button>
      </div>

      <div className="tips-card">
        <div className="tips-header">📝 Why create an account?</div>
        <div className="tips-list">
          <span>• Faster checkout process</span>
          <span>• Track your orders in real-time</span>
          <span>• Save your favorite products</span>
          <span>• Get exclusive member discounts</span>
          <span>• Manage your warranty and service requests</span>
        </div>
      </div>
    </form>
  );
}

export default RegisterForm;