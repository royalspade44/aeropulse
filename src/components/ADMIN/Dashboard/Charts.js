import React from 'react';
import './Charts.css';

const Charts = ({ sales = [35, 40, 25, 50, 65, 72, 80] }) => {
  const max = Math.max(...sales, 1);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="admin-chart">
      <h3>Weekly Sales Trend</h3>
      <div className="admin-chart-bars">
        {sales.map((value, index) => {
          const heightPercentage = (value / max) * 100;
          return (
            <div key={index} className="admin-chart-bar-wrap">
              <div 
                className="admin-chart-bar" 
                style={{ height: `${heightPercentage}%` }}
                data-value={`₱${value}`}
              />
              <span>{days[index]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Charts;