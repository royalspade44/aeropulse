import React, { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import TechLayout from '../Common/TechLayout';
import '../techShared.css';
import './ProfileTechnicianScreen.css';

const ProfileTechnicianScreen = () => {
  const { user, updateProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const openEdit = () => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(true);
  };

  const onSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await updateProfile(form);
      setIsEditing(false);
      alert('Technician profile updated.');
    } catch (error) {
      alert(`Unable to update profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <TechLayout title="Technician Profile" subtitle="View your account information">
      <div className="tech-card">
        <h3>Profile Summary</h3>
        <p><strong>Name:</strong> {user?.name || '-'}</p>
        <p><strong>Email:</strong> {user?.email || '-'}</p>
        <p><strong>Role:</strong> {user?.role || '-'}</p>
        <p><strong>Phone:</strong> {user?.phone || '-'}</p>
        <p><strong>Address:</strong> {user?.address || '-'}</p>
        <button type="button" onClick={openEdit}>Edit Profile</button>
      </div>
      {isEditing && (
        <div className="app-modal-overlay" onClick={() => setIsEditing(false)}>
          <form className="app-modal-card" onSubmit={onSave} onClick={(event) => event.stopPropagation()}>
            <h3>Edit Technician Profile</h3>
            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Name" />
            <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone" />
            <input value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} placeholder="Address" />
            <div className="app-modal-actions">
              <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
              <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      )}
    </TechLayout>
  );
};

export default ProfileTechnicianScreen;
