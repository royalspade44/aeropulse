import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TechLayout from '../Common/TechLayout';
import TaskCard from '../Dashboard/TaskCard';
import { apiRequest } from '../../../config/api';
import '../techShared.css';

const TaskScreens = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    apiRequest('/dashboard/me')
      .then((data) => setTasks(data.tasks || []))
      .catch(() => setTasks([]));
  }, []);

  return (
    <TechLayout title="Task Board" subtitle="Manage your assigned jobs">
      <div className="tech-card">
        <h3>All Tasks</h3>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onView={(selectedTask) => navigate(`/tech/tasks/${selectedTask.id}`)} />
        ))}
      </div>
    </TechLayout>
  );
};

export default TaskScreens;
