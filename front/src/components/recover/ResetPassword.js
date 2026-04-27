import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../../config/api';
import './Recover.css';

function ResetPassword() {
  const navigate = useNavigate();
  const { token = '' } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    if (!token) {
      setError('Reset link is invalid.');
      setMessage('');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setMessage('');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setMessage('');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await apiRequest(`/auth/reset-password/${encodeURIComponent(token)}`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      setMessage('Password reset successful. Redirecting to sign in...');
      window.setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1000);
    } catch (requestError) {
      setError(requestError.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recover-page">
      <div className="recover-card">
        <h1>Reset Password</h1>
        <p>Enter your new password to complete account recovery.</p>
        <form onSubmit={submit}>
          <label htmlFor="reset-password-new">New password</label>
          <input
            id="reset-password-new"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter new password"
          />

          <label htmlFor="reset-password-confirm">Confirm password</label>
          <input
            id="reset-password-confirm"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
          />

          {message ? <p style={{ color: '#0f766e', marginBottom: 12 }}>{message}</p> : null}
          {error ? <p style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</p> : null}

          <button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Reset password'}</button>
        </form>
        <Link to="/login">Back to sign in</Link>
      </div>
    </div>
  );
}

export default ResetPassword;
