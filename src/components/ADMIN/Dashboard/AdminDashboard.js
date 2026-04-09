import React, { useEffect, useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../../config/api';
import AdminLayout from '../Common/AdminLayout';
import StatsCards from './StatsCards';
import Charts from './Charts';
import '../adminShared.css';

const AdminDashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    lowStockItems: 0,
    activeTechnicians: 0,
    pendingTasks: 0,
    totalCustomers: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    apiRequest('/dashboard/me')
      .then((data) => {
        setStats({
          totalSales: data?.stats?.totalSales || 0,
          totalOrders: data?.stats?.totalOrders || 0,
          lowStockItems: data?.stats?.lowStockItems || 0,
          activeTechnicians: data?.stats?.activeTechnicians || 0,
          pendingTasks: data?.stats?.pendingTasks || 0,
          totalCustomers: data?.stats?.totalCustomers || 0
        });
      })
      .catch((error) => {
        console.error('Failed to load admin dashboard:', error);
      });
  };

  const salesTrend = [
    Math.max(10, Math.floor(stats.totalSales * 0.08)),
    Math.max(12, Math.floor(stats.totalSales * 0.11)),
    Math.max(18, Math.floor(stats.totalSales * 0.09)),
    Math.max(20, Math.floor(stats.totalSales * 0.13)),
    Math.max(28, Math.floor(stats.totalSales * 0.15)),
    Math.max(22, Math.floor(stats.totalSales * 0.12)),
    Math.max(30, Math.floor(stats.totalSales * 0.17))
  ];

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle={`Welcome back, ${user?.name?.split(' ')[0] || 'Admin'}`}
    >
      <div className="admin-grid-2">
        <div className="admin-card">
          <h3>Overview</h3>
          <p>
            Monitor sales, inventory, technician activity, and service requests from one place.
            Use the sidebar to jump to each admin module.
          </p>
        </div>
        <div className="admin-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button onClick={() => navigate('/admin/inventory')}>📦 Manage Inventory</button>
            <button onClick={() => navigate('/admin/profile')}>👤 View Admin Profile</button>
            <button onClick={() => navigate('/admin/technicians')}>🔧 Manage Technicians</button>
            <button onClick={() => navigate('/admin/reorder')}>📋 Reorder Stock</button>
            <button onClick={() => navigate('/admin/maintenance')}>🛠️ Service Requests</button>
          </div>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="admin-grid-2">
        <Charts sales={salesTrend} />
        <div className="admin-card">
          <h3>Admin Oversight</h3>
          <div className="oversight-list">
            <div className="oversight-item">
              <div className="oversight-title">📋 Policy Review</div>
              <div className="oversight-desc">Review technician SLAs and completion rates weekly.</div>
            </div>
            <div className="oversight-item">
              <div className="oversight-title">💰 Finance Validation</div>
              <div className="oversight-desc">Validate sales and refund reports before end-of-day closeout.</div>
            </div>
            <div className="oversight-item">
              <div className="oversight-title">📦 Inventory Priority</div>
              <div className="oversight-desc">Prioritize reorders for critical spare parts below threshold.</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;