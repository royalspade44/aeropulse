import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TechLayout from '../Common/TechLayout';
import UpdateTaskStatus from './UpdateTaskStatus';
import { apiRequest } from '../../../config/api';
import { useUser } from '../../../context/UserContext';
import '../techShared.css';
import './styles.css';

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    apiRequest(`/tasks/${taskId}`)
      .then((response) => setTask(response.task))
      .catch(() => setTask(null))
      .finally(() => setLoading(false));
  }, [taskId]);

  const handleAccept = async () => {
    if (!task?.id) return;
    setAccepting(true);
    try {
      const response = await apiRequest(`/tasks/${task.id}/accept`, { method: 'PATCH' });
      setTask(response.task);
      alert('Task accepted. You can now begin work on it.');
    } catch (error) {
      alert(error.message || 'Unable to accept task.');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <TechLayout title="Task Details" subtitle={`Task #${taskId}`}>
      {loading ? (
        <div className="tech-card">Loading task details...</div>
      ) : !task ? (
        <div className="tech-card">
          <h3>Task not found</h3>
          <button type="button" onClick={() => navigate('/tech/tasks')}>Back to Tasks</button>
        </div>
      ) : (
      <div className="tech-grid-2">
        <div className="tech-card">
          <h3>{task.title}</h3>
          <p><strong>Customer:</strong> {task.customer}</p>
          <p><strong>Address:</strong> {task.address}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          <p><strong>Status:</strong> {task.status}</p>
          <p><strong>Assigned Technician:</strong> {task.assignedTechnicianName || 'Unassigned'}</p>
          <p><strong>Notes:</strong> {task.notes || '-'}</p>
          {user?.role === 'technician' && task.status === 'pending' && !task.assignedTechnicianId ? (
            <button type="button" onClick={handleAccept} disabled={accepting}>
              {accepting ? 'Accepting...' : 'Accept Task'}
            </button>
          ) : null}
          <button type="button" onClick={() => navigate('/tech/tasks')}>Back to Tasks</button>
        </div>
        <UpdateTaskStatus task={task} onStatusChange={(status) => setTask((prev) => ({ ...prev, status }))} />
      </div>
      )}
    </TechLayout>
  );
};

export default TaskDetails;
