import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../adminShared.css';
import './Adminregister.css';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const update = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    navigate('/admin/dashboard');
  };

  return (
    <form className="admin-form admin-auth" onSubmit={submit}>
      <h2>Admin Register</h2>
      <input name="name" placeholder="Full name" value={form.name} onChange={update} />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={update} />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={update} />
      <button type="submit">Create Account</button>
    </form>
  );
};

export default AdminRegister;
