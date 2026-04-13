import React from 'react';

const TaskFilters = ({ filter, setFilter }) => {
  return (
    <div className="tech-card">
      <h3>Task Filters</h3>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="processing">Processing</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
};

export default TaskFilters;
