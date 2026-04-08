import React, { useEffect, useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../../config/api';
import './TechMainScreen.css';

const TechMainScreen = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    pendingTasks: 0,
    inProgressTasks: 0,
    completedToday: 0,
    totalTasks: 0
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    apiRequest('/dashboard/me')
      .then((data) => {
        setTasks(data.tasks || []);
        setStats({
          pendingTasks: data?.stats?.pendingTasks || 0,
          inProgressTasks: data?.stats?.inProgressTasks || 0,
          completedToday: data?.stats?.completedToday || 0,
          totalTasks: data?.stats?.totalTasks || 0
        });
      })
      .catch((error) => {
        console.error('Failed to load technician dashboard:', error);
        setTasks([]);
      });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="badge pending">Pending</span>;
      case 'in-progress':
        return <span className="badge in-progress">In Progress</span>;
      case 'completed':
        return <span className="badge completed">Completed</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high':
        return <span className="priority high">High</span>;
      case 'medium':
        return <span className="priority medium">Medium</span>;
      case 'low':
        return <span className="priority low">Low</span>;
      default:
        return <span className="priority">{priority}</span>;
    }
  };

  return (
    <div className="tech-dashboard">
      <div className="dashboard-header">
        <h1>Technician Dashboard</h1>
        <div className="tech-info">
          <span>Welcome, {user?.name || 'Technician'}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Pending Tasks</h3>
            <p>{stats.pendingTasks}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛠️</div>
          <div className="stat-info">
            <h3>In Progress</h3>
            <p>{stats.inProgressTasks}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Completed Today</h3>
            <p>{stats.completedToday}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Tasks</h3>
            <p>{stats.totalTasks}</p>
          </div>
        </div>
      </div>

      <div className="tasks-section">
        <h2>My Assigned Tasks</h2>
        <div className="tasks-list">
          {tasks.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="badges">
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                </div>
              </div>
              
              <div className="task-details">
                <p><strong>Customer:</strong> {task.customer}</p>
                <p><strong>Address:</strong> {task.address}</p>
                <p><strong>Date:</strong> {task.scheduledDate}</p>
                <p><strong>Time:</strong> {task.timeSlot}</p>
              </div>
              
              <div className="task-actions">
                <button 
                  className="view-btn"
                  onClick={() => navigate(`/tech/tasks/${task.taskCode || task.id}`)}
                >
                  View Details
                </button>
                {task.status === 'pending' && (
                  <button className="start-btn">Start Task</button>
                )}
                {task.status === 'in-progress' && (
                  <button className="complete-btn">Mark Complete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="tasks-section">
        <h2>Technician Notes</h2>
        <div className="task-details">
          <p><strong>Daily Goal:</strong> Complete at least 3 tasks with customer confirmation.</p>
          <p><strong>Safety Reminder:</strong> Follow lockout-tagout checks before electrical servicing.</p>
          <p><strong>Escalation:</strong> Report high-risk jobs to admin dispatcher immediately.</p>
        </div>
      </div>
    </div>
  );
};

export default TechMainScreen;