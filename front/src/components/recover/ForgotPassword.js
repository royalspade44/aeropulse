import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiRequest } from '../../config/api';
import './Recover.css';

function ForgotPassword() {
  const location = useLocation();
  const initialEmail = useMemo(() => String(location.state?.email || ''), [location.state]);

  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const normalized = String(email || '').trim().toLowerCase();

    if (!normalized) {
      setError('Please enter your registered email.');
      setMessage('');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: normalized }),
      });
      setMessage(response.message || 'Reset link sent. Please check your email.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to process password reset right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recover-page">
      <div className="recover-card">
        <h1>Forgot Password</h1>
        <p>Enter your email address and we will send a secure password reset link.</p>
        <form onSubmit={submit}>
          <label htmlFor="recover-password-email">Email</label>
          <input
            id="recover-password-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
          {message ? <p style={{ color: '#0f766e', marginBottom: 12 }}>{message}</p> : null}
          {error ? <p style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</p> : null}
          <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
        </form>
        <Link to="/login">Back to sign in</Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
