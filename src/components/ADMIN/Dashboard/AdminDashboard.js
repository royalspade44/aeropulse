import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import AdminLayout from '../Common/AdminLayout';
import { apiRequest } from '../../../config/api';
import Charts from './Charts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');

  // Sample data for the dashboard
  useEffect(() => {
    const load = async () => {
      setStatsError('');
      try {
        const result = await apiRequest('/dashboard/me');
        setStats(result.stats || null);
      } catch (e) {
        setStatsError(e.message);
      }
    };
    load();
  }, []);

  const recentActivities = [
    { id: 1, text: "New order #1234 completed", time: "2 hours ago", icon: "🛒" },
    { id: 2, text: "Technician John finished maintenance", time: "5 hours ago", icon: "🔧" },
    { id: 3, text: "Inventory updated: Brake pads", time: "1 day ago", icon: "📦" },
    { id: 4, text: "Service request #567 approved", time: "2 days ago", icon: "✅" }
  ];

  const oversightItems = [
    {
      title: "Policy Review",
      description: "Review technician SLAs and completion rates weekly."
    },
    {
      title: "Finance Validation",
      description: "Validate sales and refund reports before end-of-day closeout."
    },
    {
      title: "Inventory Priority",
      description: "Prioritize reorders for critical spare parts below threshold."
    }
  ];

  const quickActions = [
    { label: "Manage Inventory", action: () => navigate('/admin/inventory'), icon: "📦" },
    { label: "View Profile", action: () => navigate('/admin/profile'), icon: "👤" },
    { label: "Manage Technicians", action: () => navigate('/admin/technicians'), icon: "🔧" },
    { label: "Reorder Stock", action: () => navigate('/admin/reorder'), icon: "🧾" },
    { label: "Service Requests", action: () => navigate('/admin/maintenance'), icon: "🛠️" }
  ];

  const weeklySalesData = [42, 38, 55, 68, 72, 85, 78];

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Monitor sales, inventory, technicians, and requests">
      <div className="admin-dashboard">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h2>Welcome back, {user?.name || 'Admin'} 👋</h2>
          <p>Monitor sales, inventory, technician activity, and service requests from one place.</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {statsError ? <p style={{ color: '#b91c1c' }}>{statsError}</p> : null}
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Total Sales</h3>
              <p>₱{Number(stats?.totalSales || 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>Total Orders</h3>
              <p>{stats?.totalOrders || 0}</p>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <h3>Low Stock Items</h3>
              <p>{stats?.lowStockItems || 0}</p>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">🔧</div>
            <div className="stat-info">
              <h3>Active Technicians</h3>
              <p>{stats?.activeTechnicians || 0}</p>
            </div>
          </div>
        </div>

        {/* Weekly Sales Trend Chart */}
        <div className="chart-section">
          <Charts sales={weeklySalesData} />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            {quickActions.map((action, index) => (
              <button key={index} onClick={action.action}>
                <span className="action-icon">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="dashboard-two-column">
          {/* Recent Activity */}
          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">{activity.icon}</div>
                  <div className="activity-content">
                    <div className="activity-text">{activity.text}</div>
                    <div className="time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Oversight */}
          <div className="admin-oversight">
            <h3>Admin Oversight</h3>
            <div className="oversight-list">
              {oversightItems.map((item, index) => (
                <div key={index} className="oversight-item">
                  <div className="oversight-title">{item.title}</div>
                  <div className="oversight-desc">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;