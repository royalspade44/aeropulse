import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { apiRequest } from '../../../config/api';
import './SuperAdminDashboard.css';

function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    technicians: 0,
    customers: 0,
    recentlyActiveUsers: 0
  });

  useEffect(() => {
    apiRequest('/dashboard/me')
      .then((data) => {
        setStats({
          totalUsers: data?.stats?.totalUsers || 0,
          admins: data?.stats?.admins || 0,
          technicians: data?.stats?.technicians || 0,
          customers: data?.stats?.customers || 0,
          recentlyActiveUsers: data?.stats?.recentlyActiveUsers || 0
        });
      })
      .catch((error) => {
        console.error('Failed to load superadmin dashboard:', error);
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="superadmin-dashboard">
      <div className="superadmin-header">
        <div>
          <h1>Super Admin Command Center</h1>
          <p>Platform-wide controls and governance</p>
        </div>
        <div className="superadmin-user">
          <span>{user?.name || 'Super Admin'}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="superadmin-grid">
        <div className="super-card">
          <h3>Admins</h3>
          <p>Admin and superadmin accounts</p>
          <strong>{stats.admins}</strong>
        </div>
        <div className="super-card">
          <h3>Organization Users</h3>
          <p>Total active users across roles</p>
          <strong>{stats.totalUsers}</strong>
        </div>
        <div className="super-card">
          <h3>Technicians</h3>
          <p>Total field personnel accounts</p>
          <strong>{stats.technicians}</strong>
        </div>
        <div className="super-card">
          <h3>Recently Active</h3>
          <p>Users with login in last 24h</p>
          <strong>{stats.recentlyActiveUsers}</strong>
        </div>
      </div>

      <div className="superadmin-panels">
        <section>
          <h2>Global Controls</h2>
          <ul>
            <li>Manage admins and elevated permissions</li>
            <li>Audit platform activity logs</li>
            <li>Current customer accounts: {stats.customers}</li>
            <li>Enforce security policies and MFA rollout</li>
          </ul>
        </section>
        <section>
          <h2>Priority Actions</h2>
          <ul>
            <li>Review role access changes requested today</li>
            <li>Confirm backup and restore checks</li>
            <li>Approve critical production maintenance windows</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
