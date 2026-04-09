import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TechLayout from '../Common/TechLayout';
import '../techShared.css';

const TechEditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    specialization: ''
  });

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <TechLayout title="Edit Profile" subtitle="Update your technician details">
      <form
        className="tech-form"
        onSubmit={(e) => {
          e.preventDefault();
          navigate('/tech/profile');
        }}
      >
        <input name="name" value={form.name} onChange={updateField} placeholder="Full name" />
        <input name="phone" value={form.phone} onChange={updateField} placeholder="Phone number" />
        <input name="specialization" value={form.specialization} onChange={updateField} placeholder="Specialization" />
        <button type="submit">Save Profile</button>
      </form>
    </TechLayout>
  );
};

export default TechEditProfile;
