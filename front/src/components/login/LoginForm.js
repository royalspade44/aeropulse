import { useState } from 'react';
import InputField from '../common/InputField';
import Button from '../common/Button';
import icons from '../common/icons';

function LoginForm({ 
  email, 
  password, 
  branch,
  branchOptions = [],
  errors, 
  onEmailChange, 
  onPasswordChange, 
  onBranchChange,
  onSubmit, 
  loading, 
  disabled,
  onForgotPassword
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputField
        label="Email Address"
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={onEmailChange}
        error={errors.email}
        disabled={disabled}
        required
      />

      <div className="input-group">
        <label>Branch</label>
        <select
          value={branch}
          onChange={(event) => onBranchChange(event.target.value)}
          disabled={disabled}
          className={errors.branch ? 'input-error' : ''}
        >
          <option value="">Select branch (required for admin and technician accounts)</option>
          {branchOptions.map((branchName) => (
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

      <div className="input-group">
        <label>Password <span className="required-star">*</span></label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            disabled={disabled}
            className={errors.password ? 'input-error' : ''}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#1E88E5',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
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

      <button type="button" className="forgot-link" onClick={onForgotPassword}>
        Forgot password?
      </button>

      <Button
        type="submit"
        disabled={disabled || loading}
        className="login-button"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}

export default LoginForm;