import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';
import { apiRequest } from '../../config/api';
import './ProfileCenter.css';

function ProfileCenter() {
  const navigate = useNavigate();
  const { user, updateProfile } = useUser();
  const { cart, getCartCount, getCartTotal } = useCart();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState({
    toPay: 0,
    toDeliver: 0,
    toInstall: 0,
    complete: 0
  });

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    avatarUrl: ''
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      avatarUrl: user.avatarUrl || ''
    });
  }, [user]);

  useEffect(() => {
    apiRequest('/orders/me/summary')
      .then(res => setSummary(res.summary || summary))
      .catch(() => {});
  }, []);

  const profileInitial = useMemo(() => {
    const name = form.name || user?.email || 'U';
    return name.charAt(0).toUpperCase();
  }, [form.name, user?.email]);

  const onSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      alert('Profile saved successfully.');
      setIsEditing(false);
    } catch (error) {
      alert(error.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">

      {/* HEADER */}
      <div className="profile-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/home')}>
            ←
          </button>
          <div>
            <h1>My Profile</h1>
            <p>Manage your account and activity</p>
          </div>
        </div>

        <div className="header-right">
          <div className="header-avatar">
            {profileInitial}
          </div>
          <div>
            <div className="header-name">{form.name || 'User'}</div>
            <div className="header-email">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="profile-layout">

        {/* LEFT SIDE */}
        <div className="profile-left">
          <div className="card">
            <h2>Profile Info</h2>

            <div className="avatar-large">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="" />
              ) : (
                profileInitial
              )}
            </div>

            <div className="profile-form">
              <input
                className="input"
                value={form.name}
                placeholder="Display name"
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                disabled={!isEditing}
              />

              <input
                className="input"
                value={form.phone}
                placeholder="Phone"
                onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                disabled={!isEditing}
              />

              <input
                className="input"
                value={form.address}
                placeholder="Address"
                onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
                disabled={!isEditing}
              />

              <input
                className="input"
                value={form.avatarUrl}
                placeholder="Profile picture URL"
                onChange={(e) => setForm(p => ({ ...p, avatarUrl: e.target.value }))}
                disabled={!isEditing}
              />

              {!isEditing ? (
                <button className="primary-btn" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              ) : (
                <div className="btn-row">
                  <button className="primary-btn" onClick={onSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button className="ghost-btn" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="profile-right">

          {/* CART */}
          <div className="card">
            <h2>Cart</h2>

            <div className="stat-row">
              <span>Items</span>
              <strong>{getCartCount()}</strong>
            </div>

            <div className="stat-row">
              <span>Total</span>
              <strong>₱ {getCartTotal().toLocaleString()}</strong>
            </div>

            <button className="primary-btn" onClick={() => navigate('/shop')}>
              View Cart
            </button>
          </div>

          {/* ORDERS */}
          <div className="card">
            <h2>Orders</h2>

            <div className="order-grid">
              <div className="order-box">To Pay <span>{summary.toPay}</span></div>
              <div className="order-box">To Deliver <span>{summary.toDeliver}</span></div>
              <div className="order-box">To Install <span>{summary.toInstall}</span></div>
              <div className="order-box done">Completed <span>{summary.complete}</span></div>
            </div>

            <button className="primary-btn" onClick={() => navigate('/my-orders')}>
              Open Orders
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProfileCenter;