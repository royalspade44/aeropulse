import React, { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import './styles.css';

const ChangePassword = () => {
  const { changePassword } = useUser();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    if (!form.current || !form.next || !form.confirm) {
      setMessage('All password fields are required.');
      return;
    }
    if (form.next !== form.confirm) {
      setMessage('New password and confirmation do not match.');
      return;
    }
    try {
      setLoading(true);
      await changePassword(form.current, form.next);
      setMessage('Password updated successfully.');
      setForm({ current: '', next: '', confirm: '' });
    } catch (error) {
      setMessage(error.message || 'Unable to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <h3>Change Password</h3>
      <input name="current" type="password" value={form.current} onChange={updateField} placeholder="Current password" />
      <input name="next" type="password" value={form.next} onChange={updateField} placeholder="New password" />
      <input name="confirm" type="password" value={form.confirm} onChange={updateField} placeholder="Confirm password" />
      <button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default ChangePassword;
