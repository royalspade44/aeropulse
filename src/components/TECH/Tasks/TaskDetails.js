import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TechLayout from '../Common/TechLayout';
import UpdateTaskStatus from './UpdateTaskStatus';
import '../techShared.css';

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState({
    id: taskId,
    title: `Service Task ${taskId}`,
    customer: 'Sample Customer',
    address: 'Quezon City',
    priority: 'medium',
    status: 'pending',
    notes: 'Inspect condenser and clean filters.'
  });

  return (
    <TechLayout title="Task Details" subtitle={`Task #${taskId}`}>
      <div className="tech-grid-2">
        <div className="tech-card">
          <h3>{task.title}</h3>
          <p><strong>Customer:</strong> {task.customer}</p>
          <p><strong>Address:</strong> {task.address}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          <p><strong>Status:</strong> {task.status}</p>
          <p><strong>Notes:</strong> {task.notes}</p>
          <button type="button" onClick={() => navigate('/tech/tasks')}>Back to Tasks</button>
        </div>
        <UpdateTaskStatus task={task} onStatusChange={(status) => setTask((prev) => ({ ...prev, status }))} />
      </div>
    </TechLayout>
  );
};

export default TaskDetails;
