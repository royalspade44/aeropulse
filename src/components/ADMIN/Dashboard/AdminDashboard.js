import React, { useEffect, useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../../config/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useUser();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-info">
          <span>Welcome, {user?.name || 'Admin'}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Sales</h3>
            <p>₱{stats.totalSales.toLocaleString()}</p>
            <span>This month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
            <span>All time</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>Low Stock Items</h3>
            <p>{stats.lowStockItems}</p>
            <span>Need reorder</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔧</div>
          <div className="stat-info">
            <h3>Active Technicians</h3>
            <p>{stats.activeTechnicians}</p>
            <span>Currently working</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Pending Tasks</h3>
            <p>{stats.pendingTasks}</p>
            <span>Need attention</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Customers</h3>
            <p>{stats.totalCustomers}</p>
            <span>Registered users</span>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={() => navigate('/admin/inventory')}>Manage Inventory</button>
          <button onClick={() => navigate('/admin/sales')}>View Sales</button>
          <button onClick={() => navigate('/admin/technicians')}>Manage Technicians</button>
          <button onClick={() => navigate('/admin/reorder')}>Reorder Stock</button>
          <button onClick={() => navigate('/admin/maintenance')}>Service Requests</button>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="time">10:30 AM</span>
            <span>New order #ORD-001 received</span>
          </div>
          <div className="activity-item">
            <span className="time">09:45 AM</span>
            <span>Low stock alert: AC Filter (5 left)</span>
          </div>
          <div className="activity-item">
            <span className="time">09:00 AM</span>
            <span>Technician John assigned to task #TSK-123</span>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Admin Oversight</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="time">Policy</span>
            <span>Review technician SLAs and completion rates weekly.</span>
          </div>
          <div className="activity-item">
            <span className="time">Finance</span>
            <span>Validate sales and refund reports before end-of-day closeout.</span>
          </div>
          <div className="activity-item">
            <span className="time">Inventory</span>
            <span>Prioritize reorders for critical spare parts below threshold.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;