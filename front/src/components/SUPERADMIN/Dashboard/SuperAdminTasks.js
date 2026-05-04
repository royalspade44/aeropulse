import React, { useEffect, useMemo, useState } from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import { apiRequest } from '../../../config/api';
import '../superAdminShared.css';

const toHours = (value) => Math.max(0, Math.round(value / (1000 * 60 * 60)));
const pickDate = (task) => new Date(task.updatedAt || task.createdAt || Date.now());
const normalizeStatus = (value) => String(value || '').replace(/_/g, ' ');

const SuperAdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await apiRequest('/tasks');
        if (!active) return;
        setTasks(Array.isArray(result.tasks) ? result.tasks : []);
      } catch (err) {
        if (!active) return;
        setTasks([]);
        setError(err.message || 'Unable to load tasks');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const processingTasks = useMemo(() => {
    const now = Date.now();
    return tasks
      .filter((task) => {
        const status = String(task.status || '').toLowerCase();
        return status !== 'completed' && status !== 'cancelled';
      })
      .map((task) => {
        const taskDate = pickDate(task);
        return {
          id: task.taskCode || task.code || task.id,
          technician: task.assignedTechnicianName || 'Unassigned',
          customer: task.customerName || task.customer || 'Customer',
          status: normalizeStatus(task.status || 'Processing'),
          agingHours: toHours(now - taskDate.getTime()),
        };
      });
  }, [tasks]);

  return (
    <SuperAdminLayout title="Processing Tech Tasks" subtitle="Overdue or unresolved field work">
      <div className="super-card">
        <h3>Task Escalation Queue</h3>
        <div className="super-list">
          {loading ? <p>Loading…</p> : null}
          {error ? <p className="super-muted">{error}</p> : null}
          {!loading && !processingTasks.length ? <p>No unresolved tasks right now.</p> : null}
          {!loading && processingTasks.map((task) => (
            <div key={task.id} className="super-list-item">
              <strong>{task.id}</strong>
              <p>Technician: {task.technician}</p>
              <p>Customer: {task.customer}</p>
              <p>Status: {task.status}</p>
              <p>Aging: {task.agingHours} hours</p>
            </div>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminTasks;
