import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { apiRequest } from '../../../config/api';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import icons from '../../common/icons';
import '../superAdminShared.css';
import './SuperAdminDashboard.css';

function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user, updateProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    technicians: 0,
    customers: 0,
    recentlyActiveUsers: 0,
    totalOrders: 0,
    latestSalesBranch: '-'
  });

  useEffect(() => {
    Promise.all([
      apiRequest('/dashboard/me'),
      apiRequest('/orders')
    ])
      .then(([dashData, ordersData]) => {
        const orders = Array.isArray(ordersData?.orders) ? ordersData.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
        const latestBranch = orders.length > 0 ? (orders[0]?.branch || orders[0]?.stockSourceBranch || '-') : '-';
        setStats({
          totalUsers: dashData?.stats?.totalUsers || 0,
          admins: dashData?.stats?.admins || 0,
          technicians: dashData?.stats?.technicians || 0,
          customers: dashData?.stats?.customers || 0,
          recentlyActiveUsers: dashData?.stats?.recentlyActiveUsers || 0,
          totalOrders: orders.length,
          latestSalesBranch: latestBranch
        });
      })
      .catch((error) => {
        console.error('Failed to load superadmin dashboard:', error);
      });
  }, []);

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
      alert('Super admin profile updated.');
    } catch (error) {
      alert(`Unable to update profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminLayout title="Super Admin Command Center" subtitle={`Welcome, ${user?.name || 'Boss'}`}>
      <div className="super-grid">
        <div className="super-card">
          <h3>Customer Accounts</h3>
          <strong>{stats.customers}</strong>
        </div>
        <div className="super-card">
          <h3>Total Orders</h3>
          <strong>{stats.totalOrders}</strong>
        </div>
        <div className="super-card">
          <h3>Latest Sales Branch</h3>
          <strong>{stats.latestSalesBranch}</strong>
        </div>
        <div className="super-card">
          <h3>Admins</h3>
          <strong>{stats.admins}</strong>
        </div>
      </div>

      <div className="super-grid-2">
        <div className="super-card">
          <h2>Boss Controls</h2>
          <div className="super-list">
            <button type="button" onClick={() => navigate('/superadmin/branches')}><img src={icons.marker} alt="" className="inline-icon" /> Branch Location Handling</button>
            <button type="button" onClick={() => navigate('/superadmin/sales')}><img src={icons.cartShoppingFast} alt="" className="inline-icon" /> Processing Sales</button>
            <button type="button" onClick={() => navigate('/superadmin/inventory')}><img src={icons.boxOpen} alt="" className="inline-icon" /> Inventory Checker</button>
            <button type="button" onClick={() => navigate('/superadmin/tasks')}><img src={icons.tools} alt="" className="inline-icon" /> Processing Tech Tasks</button>
            <button type="button" onClick={() => navigate('/superadmin/alerts')}><img src={icons.diamondExclamation} alt="" className="inline-icon" /> Customer Complaint Alerts</button>
          </div>
        </div>
        <div className="super-card">
          <h2>Executive Notes</h2>
          <p><strong>Name:</strong> {user?.name || 'Super Admin'}</p>
          <p><strong>Email:</strong> {user?.email || 'superadmin@aeropulse.com'}</p>
          <p><strong>Phone:</strong> {user?.phone || '-'}</p>
          <p><strong>Address:</strong> {user?.address || '-'}</p>
          <button type="button" onClick={openEdit}>Edit Profile</button>
          <ul>
            <li>Current customer accounts: {stats.customers}</li>
            <li>Review escalation board every morning and before close.</li>
            <li>Validate branch inventory risk for critical spare parts.</li>
            <li>Track unresolved complaints beyond 24 hours.</li>
          </ul>
        </div>
      </div>
      {isEditing && (
        <div className="app-modal-overlay" onClick={() => setIsEditing(false)}>
          <form className="app-modal-card" onSubmit={onSave} onClick={(event) => event.stopPropagation()}>
            <h3>Edit Super Admin Profile</h3>
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
    </SuperAdminLayout>
  );
}

export default SuperAdminDashboard;
