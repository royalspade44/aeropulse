import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../config/api';
import { BRANCHES } from '../../../domain/branches/branches';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import Charts from '../../ADMIN/Dashboard/Charts';
import SalesAnalyticsChart from '../../ADMIN/Dashboard/SalesAnalyticsChart';
import TopProductsChart from '../../ADMIN/Dashboard/TopProductsChart';
import TechnicianKPIs from '../../ADMIN/Dashboard/TechnicianKPIs';
import CustomerAcquisitionChart from '../../ADMIN/Dashboard/CustomerAcquisitionChart';
import '../superAdminShared.css';
import './styles.css';

const SuperAdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [statsError, setStatsError] = useState('');
  const [selectedSalesPeriod, setSelectedSalesPeriod] = useState('monthly');
  const [report, setReport] = useState({ topProducts: [], monthlySeries: [] });

  useEffect(() => {
    apiRequest('/products')
      .then((data) => setProducts(data.products || []))
      .catch((err) => setError(err.message || 'Unable to load inventory'));
  }, []);

  useEffect(() => {
    const load = async () => {
      setStatsError('');
      try {
        // Load centralized stats across all branches
        const result = await apiRequest('/dashboard/superadmin');
        setStats(result.stats || null);
        setAnalytics(result.analytics || null);
      } catch (e) {
        setStatsError(e.message);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadReport = async () => {
      try {
        const now = new Date();
        const fromTop = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const top = await apiRequest(
          `/reports/sales/superadmin?interval=weekly&from=${encodeURIComponent(fromTop.toISOString())}&to=${encodeURIComponent(now.toISOString())}&topN=5`
        );

        const fromMonthly = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        const monthly = await apiRequest(
          `/reports/sales/superadmin?interval=monthly&from=${encodeURIComponent(fromMonthly.toISOString())}&to=${encodeURIComponent(now.toISOString())}&topN=5`
        );

        if (!mounted) return;
        setReport({
          topProducts: Array.isArray(top.topProducts) ? top.topProducts : [],
          monthlySeries: Array.isArray(monthly.series) ? monthly.series : [],
        });
      } catch (_e) {
        if (!mounted) return;
        setReport({ topProducts: [], monthlySeries: [] });
      }
    };

    loadReport();
    const pollId = window.setInterval(loadReport, 15000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadReport();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      mounted = false;
      window.clearInterval(pollId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const alerts = [];
  products.forEach((product) => {
    const branchStock = product.branchStock || {};
    BRANCHES.forEach((branch) => {
      const stock = Number(branchStock[branch] || 0);
      const threshold = Number(product.threshold || 0);
      if (threshold > 0 && stock < threshold) {
        alerts.push({
          id: `${product.id}-${branch}`,
          item: product.name,
          branch,
          stock,
          threshold,
          level: stock <= Math.floor(threshold * 0.5) ? 'Critical' : 'Low',
        });
      }
    });
  });

  return (
    <SuperAdminLayout title="Super Admin Dashboard" subtitle="Centralized analytics across all branches">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* Stats Cards */}
        {stats && (
          <div className="super-stats-grid" style={{ width: '100%', maxWidth: '1200px', marginBottom: '2rem' }}>
            <div className="super-stat-card">
              <h4>Total Sales</h4>
              <p className="super-stat-value">PHP {stats.totalSales?.toLocaleString() || 0}</p>
              <p className="super-stat-label">Across all branches</p>
            </div>
            <div className="super-stat-card">
              <h4>Total Orders</h4>
              <p className="super-stat-value">{stats.totalOrders || 0}</p>
              <p className="super-stat-label">All branches combined</p>
            </div>
            <div className="super-stat-card">
              <h4>Active Technicians</h4>
              <p className="super-stat-value">{stats.activeTechnicians || 0}</p>
              <p className="super-stat-label">Across all branches</p>
            </div>
            <div className="super-stat-card">
              <h4>Low Stock Alerts</h4>
              <p className="super-stat-value">{alerts.length}</p>
              <p className="super-stat-label">Items below threshold</p>
            </div>
          </div>
        )}

        {/* Analytics Charts */}
        <div style={{ width: '100%', maxWidth: '1200px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div className="super-card">
            <SalesAnalyticsChart 
              data={report.monthlySeries} 
              period={selectedSalesPeriod}
              onPeriodChange={setSelectedSalesPeriod}
              title="Sales Analytics - All Branches"
            />
          </div>
          <div className="super-card">
            <TopProductsChart 
              data={report.topProducts} 
              title="Top Products - All Branches"
            />
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '1200px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div className="super-card">
            <TechnicianKPIs 
              data={analytics?.technicianKPIs || []} 
              title="Technician Performance - All Branches"
            />
          </div>
          <div className="super-card">
            <CustomerAcquisitionChart 
              data={analytics?.customerAcquisition || []} 
              title="Customer Acquisition - All Branches"
            />
          </div>
        </div>

        {/* Inventory Risk Board */}
        <div className="super-card" style={{ width: '100%', maxWidth: '1200px' }}>
          <h3>Inventory Risk Board</h3>
          {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
          <div className="super-list">
            {alerts.length === 0 ? <p>No low stock alerts right now.</p> : null}
            {alerts.map((alert) => (
              <div key={alert.id} className="super-list-item">
                <strong>{alert.item}</strong>
                <p>{alert.branch}</p>
                <p>Stock: {alert.stock} / Threshold: {alert.threshold}</p>
                <p>Level: {alert.level}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
