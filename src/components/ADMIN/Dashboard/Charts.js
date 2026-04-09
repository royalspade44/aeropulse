import React from 'react';

const Charts = ({ sales = [35, 40, 25, 50, 65, 72, 80] }) => {
  const max = Math.max(...sales, 1);

  return (
    <section className="admin-chart">
      <h3>Weekly Sales Trend</h3>
      <div className="admin-chart-bars">
        {sales.map((value, index) => (
          <div key={`${value}-${index}`} className="admin-chart-bar-wrap">
            <div className="admin-chart-bar" style={{ height: `${(value / max) * 100}%` }} />
            <span>Day {index + 1}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Charts;
