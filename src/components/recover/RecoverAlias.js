import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Recover.css';

function RecoverAlias() {
  const [email, setEmail] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Enter the email on your account.');
      return;
    }
    alert(
      `Demo: If an account exists for ${email}, we would email a link to view or change your alias. Check your inbox (simulated).`
    );
  };

  return (
    <div className="recover-page">
      <div className="recover-card">
        <h1>Forgot my alias</h1>
        <p>Enter your email address. We will send a link to retrieve or update your preferred alias.</p>
        <form onSubmit={submit}>
          <label htmlFor="recover-alias-email">Email</label>
          <input
            id="recover-alias-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <button type="submit">Send recovery link</button>
        </form>
        <Link to="/login">Back to sign in</Link>
      </div>
    </div>
  );
}

export default RecoverAlias;
