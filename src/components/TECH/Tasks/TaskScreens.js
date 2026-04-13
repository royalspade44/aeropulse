import React from 'react';
import { useNavigate } from 'react-router-dom';
import TechLayout from '../Common/TechLayout';
import TaskCard from '../Dashboard/TaskCard';
import '../techShared.css';

const taskList = [
  { id: 101, title: 'Split Type Cleaning', customer: 'Anna Cruz', address: 'Makati', status: 'processing', priority: 'high' },
  { id: 102, title: 'Compressor Check', customer: 'Mark Lee', address: 'Taguig', status: 'in-progress', priority: 'medium' },
  { id: 103, title: 'Installation Follow-up', customer: 'Celine Tan', address: 'Pasig', status: 'completed', priority: 'low' }
];

const TaskScreens = () => {
  const navigate = useNavigate();

  return (
    <TechLayout title="Task Board" subtitle="Manage your assigned jobs">
      <div className="tech-card">
        <h3>All Tasks</h3>
        {taskList.map((task) => (
          <TaskCard key={task.id} task={task} onView={(selectedTask) => navigate(`/tech/tasks/${selectedTask.id}`)} />
        ))}
      </div>
    </TechLayout>
  );
};

export default TaskScreens;
