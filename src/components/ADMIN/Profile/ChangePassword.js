import React, { useState } from 'react';
import './ChangePassword.css';

const ChangePassword = () => {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [message, setMessage] = useState('');

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (form.next !== form.confirm) {
      setMessage('New password and confirmation do not match.');
      return;
    }
    setMessage('Password updated successfully (demo).');
    setForm({ current: '', next: '', confirm: '' });
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <h3>Change Password</h3>
      <input name="current" type="password" value={form.current} onChange={updateField} placeholder="Current password" />
      <input name="next" type="password" value={form.next} onChange={updateField} placeholder="New password" />
      <input name="confirm" type="password" value={form.confirm} onChange={updateField} placeholder="Confirm password" />
      <button type="submit">Update Password</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default ChangePassword;
