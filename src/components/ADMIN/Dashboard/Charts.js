import React from 'react';
import './Charts.css';
import icons from '../../common/icons';

const Charts = ({ sales = [35, 40, 25, 50, 65, 72, 80] }) => {
  const max = Math.max(...sales, 1);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="admin-chart">
      <h3>
        <img src={icons.clipboardList} alt="" className="admin-chart-title-icon inline-icon inline-icon--md" />
        Weekly Sales Trend
      </h3>
      <div className="admin-chart-bars">
        {sales.map((value, index) => {
          const heightPercentage = (value / max) * 100;
          return (
            <div key={index} className="admin-chart-bar-wrap">
              <div
                className="admin-chart-bar"
                style={{ height: `${heightPercentage}%` }}
                data-value={`\u20b1${value}`}
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
