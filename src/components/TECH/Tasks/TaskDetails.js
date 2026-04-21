import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TechLayout from '../Common/TechLayout';
import UpdateTaskStatus from './UpdateTaskStatus';
import { apiRequest } from '../../../config/api';
import '../techShared.css';
import './TaskDetails.css';

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest(`/tasks/${taskId}`)
      .then((response) => setTask(response.task))
      .catch(() => setTask(null))
      .finally(() => setLoading(false));
  }, [taskId]);

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
          <p><strong>Notes:</strong> {task.notes || '-'}</p>
          <button type="button" onClick={() => navigate('/tech/tasks')}>Back to Tasks</button>
        </div>
        <UpdateTaskStatus task={task} onStatusChange={(status) => setTask((prev) => ({ ...prev, status }))} />
      </div>
      )}
    </TechLayout>
  );
};

export default TaskDetails;
