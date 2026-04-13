import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Recover.css';

function RecoverTotp() {
  const [email, setEmail] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Enter the email on your account.');
      return;
    }
    alert(
      `Demo: If an account exists for ${email}, we would email a link to enroll a new TOTP secret after identity checks.`
    );
  };

  return (
    <div className="recover-page">
      <div className="recover-card">
        <h1>Lost my secret</h1>
        <p>Enter your email address. We will send a link to generate and set up a new rolling passcode (TOTP).</p>
        <form onSubmit={submit}>
          <label htmlFor="recover-totp-email">Email</label>
          <input
            id="recover-totp-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <button type="submit">Send setup link</button>
        </form>
        <Link to="/login">Back to sign in</Link>
      </div>
    </div>
  );
}

export default RecoverTotp;
