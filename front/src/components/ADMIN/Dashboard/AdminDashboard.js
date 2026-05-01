import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import AdminLayout from '../Common/AdminLayout';
import { apiRequest } from '../../../config/api';
import Charts from './Charts';
import SalesAnalyticsChart from './SalesAnalyticsChart';
import TopProductsChart from './TopProductsChart';
import TechnicianKPIs from './TechnicianKPIs';
import CustomerAcquisitionChart from './CustomerAcquisitionChart';
import icons from '../../common/icons';
import './styles.css';

const AdminDashboard = () => {
  const { user } = useUser();
  const activeBranch = localStorage.getItem('activeBranch') || user?.activeBranch || '';
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [statsError, setStatsError] = useState('');
  const [selectedSalesPeriod, setSelectedSalesPeriod] = useState('monthly');

  useEffect(() => {
    const load = async () => {
      setStatsError('');
      try {
        const result = await apiRequest('/dashboard/me');
        setStats(result.stats || null);
        setAnalytics(result.analytics || null);
      } catch (e) {
        setStatsError(e.message);
      }
    };
    load();
  }, []);

  const recentActivities = [
    { id: 1, text: 'New order #1234 completed', time: '2 hours ago', icon: icons.cartShoppingFast },
    { id: 2, text: 'Technician John finished maintenance', time: '5 hours ago', icon: icons.tools },
    { id: 3, text: 'Inventory updated: Brake pads', time: '1 day ago', icon: icons.boxOpen },
    { id: 4, text: 'Service request #567 approved', time: '2 days ago', icon: icons.checkCircle }
  ];

  const oversightItems = [
    {
      title: 'Policy Review',
      description: 'Review technician SLAs and completion rates weekly.'
    },
    {
      title: 'Finance Validation',
      description: 'Validate sales and refund reports before end-of-day closeout.'
    },
    {
      title: 'Inventory Priority',
      description: 'Prioritize reorders for critical spare parts below threshold.'
    }
  ];

  const quickActions = [
    { label: 'Manage Inventory', action: () => navigate('/admin/inventory'), icon: icons.boxOpen },
    { label: 'View Profile', action: () => navigate('/admin/profile'), icon: icons.memberList },
    { label: 'Manage Technicians', action: () => navigate('/admin/technicians'), icon: icons.memberList },
    { label: 'Process Orders', action: () => navigate('/admin/orders'), icon: icons.clipboardList },
    { label: 'Reorder Stock', action: () => navigate('/admin/reorder'), icon: icons.cartShoppingFast },
    { label: 'Service Requests', action: () => navigate('/admin/maintenance'), icon: icons.tools },
    { label: 'Store Operations', action: () => navigate('/admin/store'), icon: icons.houseChimney }
  ];

  const weeklySalesData = [42, 38, 55, 68, 72, 85, 78];

  const getSalesPeriodData = () => {
    if (!analytics?.sales) return [];
    return analytics.sales[selectedSalesPeriod] || [];
  };

  return (
    <AdminLayout title="Admin Dashboard" subtitle={`Monitor sales, inventory, technicians, and requests${activeBranch ? ` for ${activeBranch}` : ''}`}>
      <div className="admin-dashboard">
        <div className="welcome-section">
          <h2>Welcome back, {user?.name || 'Admin'}</h2>
          <p>Monitor sales, inventory, technician activity, and service requests from one place.</p>
        </div>

        <div className="stats-grid">
          {statsError ? <p style={{ color: '#b91c1c' }}>{statsError}</p> : null}
          <div className="stat-card">
            <div className="stat-icon">
              <img src={icons.cartShoppingFast} alt="" className="inline-icon inline-icon--xl" />
            </div>
            <div className="stat-info">
              <h3>Total Sales</h3>
              <p>{'₱'}{Number(stats?.totalSales || 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <img src={icons.clipboardList} alt="" className="inline-icon inline-icon--xl" />
            </div>
            <div className="stat-info">
              <h3>Total Orders</h3>
              <p>{stats?.totalOrders || 0}</p>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">
              <img src={icons.diamondExclamation} alt="" className="inline-icon inline-icon--xl" />
            </div>
            <div className="stat-info">
              <h3>Low Stock Items</h3>
              <p>{stats?.lowStockItems || 0}</p>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <img src={icons.tools} alt="" className="inline-icon inline-icon--xl" />
            </div>
            <div className="stat-info">
              <h3>Active Technicians</h3>
              <p>{stats?.activeTechnicians || 0}</p>
            </div>
          </div>
        </div>

        <div className="chart-section">
          <Charts sales={weeklySalesData} />
        </div>

        {/* Sales Analytics Section */}
        {analytics?.sales && (
          <div className="analytics-section">
            <div className="section-card">
              <div className="section-header">
                <h3>Sales Analytics</h3>
                <div className="period-tabs">
                  <button
                    className={`period-tab ${selectedSalesPeriod === 'daily' ? 'active' : ''}`}
                    onClick={() => setSelectedSalesPeriod('daily')}
                  >
                    Daily
                  </button>
                  <button
                    className={`period-tab ${selectedSalesPeriod === 'monthly' ? 'active' : ''}`}
                    onClick={() => setSelectedSalesPeriod('monthly')}
                  >
                    Monthly
                  </button>
                  <button
                    className={`period-tab ${selectedSalesPeriod === 'quarterly' ? 'active' : ''}`}
                    onClick={() => setSelectedSalesPeriod('quarterly')}
                  >
                    Quarterly
                  </button>
                </div>
              </div>
              <div className="section-content">
                <SalesAnalyticsChart period={selectedSalesPeriod} data={getSalesPeriodData()} />
              </div>
            </div>
          </div>
        )}

        {/* Top Products Section */}
        {analytics?.topProducts && (
          <div className="analytics-section">
            <div className="section-card">
              <div className="section-header">
                <h3>Top 5 Selling Products</h3>
              </div>
              <div className="section-content">
                <TopProductsChart products={analytics.topProducts} />
              </div>
            </div>
          </div>
        )}

        {/* Customer Acquisition Section (for superadmin only) */}
        {user?.role === 'superadmin' && analytics?.customerAcquisition && (
          <div className="analytics-section">
            <div className="section-card">
              <div className="section-header">
                <h3>Marketing Performance - Customer Acquisition by Source</h3>
              </div>
              <div className="section-content">
                <CustomerAcquisitionChart sources={analytics.customerAcquisition} />
              </div>
            </div>
          </div>
        )}

        {/* Technician KPIs Section */}
        {analytics?.technicianKPIs && (
          <div className="analytics-section">
            <div className="section-card">
              <div className="section-header">
                <h3>Technician Performance KPIs</h3>
              </div>
              <div className="section-content">
                <TechnicianKPIs technicians={analytics.technicianKPIs} />
              </div>
            </div>
          </div>
        )}

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            {quickActions.map((action, index) => (
              <button key={index} type="button" onClick={action.action}>
                <span className="action-icon">
                  <img src={action.icon} alt="" className="inline-icon inline-icon--md" />
                </span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-two-column">
          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <img src={activity.icon} alt="" className="inline-icon inline-icon--md" />
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">{activity.text}</div>
                    <div className="time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
