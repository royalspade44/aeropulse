import React from 'react';
import './styles.css';

const TaskCard = ({ task, onView }) => {
  return (
    <div className="tech-task-card">
      <h3>{task.title}</h3>
      <p><strong>Customer:</strong> {task.customer}</p>
      <p><strong>Address:</strong> {task.address}</p>
      <p><strong>Status:</strong> {task.status}</p>
      <p><strong>Priority:</strong> {task.priority}</p>
      <div className="tech-task-actions">
        <button type="button" onClick={() => onView(task)}>View Details</button>
      </div>
    </div>
  );
};

export default TaskCard;
