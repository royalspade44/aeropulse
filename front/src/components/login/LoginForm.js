import { useState } from 'react';
import InputField from '../common/InputField';
import Button from '../common/Button';
import icons from '../common/icons';

function LoginForm({ 
  email, 
  password,
  errors, 
  onEmailChange, 
  onPasswordChange, 
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
        <label>Password <span className="required-star">*</span></label>
        <div className="password-wrapper">
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
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
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