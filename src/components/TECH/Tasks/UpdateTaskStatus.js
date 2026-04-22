import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../config/api';
import './styles.css';

const UpdateTaskStatus = ({ task, onStatusChange }) => {
  const [status, setStatus] = useState(task?.status || 'pending');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus(task?.status || 'pending');
  }, [task?.status]);

  const handleSave = () => {
    if (!task?.id) return;
    setSaving(true);
    apiRequest(`/tasks/${task.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
      .then((response) => {
        onStatusChange(response.task.status);
        alert('Task status updated.');
      })
      .catch((error) => {
        alert(error.message || 'Unable to update task status.');
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="tech-form">
      <h3>Update Task Status</h3>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <button type="button" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Status'}
      </button>
    </div>
  );
};

export default UpdateTaskStatus;
