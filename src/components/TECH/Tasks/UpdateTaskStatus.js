import React, { useState } from 'react';

const UpdateTaskStatus = ({ task, onStatusChange }) => {
  const [status, setStatus] = useState(task?.status || 'pending');

  return (
    <div className="tech-form">
      <h3>Update Task Status</h3>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <button type="button" onClick={() => onStatusChange(status)}>Save Status</button>
    </div>
  );
};

export default UpdateTaskStatus;
