import React, { useEffect, useMemo, useState } from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import { apiRequest } from '../../../config/api';
import '../superAdminShared.css';

const buildSeverity = (notification) => {
  const message = String(notification.message || '').toLowerCase();
  if (message.includes('urgent') || message.includes('critical')) return 'High';
  if (notification.type === 'order') return 'High';
  return 'Medium';
};

const SuperAdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await apiRequest('/notifications/me');
        if (!active) return;
        setAlerts(Array.isArray(result.notifications) ? result.notifications : []);
      } catch (err) {
        if (!active) return;
        setAlerts([]);
        setError(err.message || 'Unable to load alerts');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const complaintAlerts = useMemo(() => {
    return alerts
      .filter((alert) => alert.type === 'system' || alert.type === 'order')
      .map((alert) => ({
        id: alert.id,
        customer: alert.customer || 'Customer',
        branch: alert.branch || alert.activeBranch || '-',
        concern: alert.message || alert.title || 'Customer alert',
        severity: buildSeverity(alert),
      }));
  }, [alerts]);

  return (
    <SuperAdminLayout title="Customer Complaint Alerts" subtitle="Critical customer concerns requiring executive review">
      <div className="super-card">
        <h3>Complaint Alert Feed</h3>
        <div className="super-list">
          {loading ? <p>Loading…</p> : null}
          {error ? <p className="super-muted">{error}</p> : null}
          {!loading && !complaintAlerts.length ? <p>No complaint alerts right now.</p> : null}
          {!loading && complaintAlerts.map((alert) => (
            <div key={alert.id} className="super-list-item">
              <strong>{alert.id}</strong>
              <p>Customer: {alert.customer}</p>
              <p>Branch: {alert.branch}</p>
              <p>Concern: {alert.concern}</p>
              <p>Severity: {alert.severity}</p>
            </div>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAlerts;
