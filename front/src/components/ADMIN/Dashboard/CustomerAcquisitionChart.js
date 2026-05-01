import React from 'react';

/**
 * CustomerAcquisitionChart - Display customer acquisition by source
 */
const CustomerAcquisitionChart = ({ sources = [] }) => {
  if (!sources || sources.length === 0) {
    return (
      <div className="acquisition-chart">
        <p>No acquisition data available</p>
      </div>
    );
  }

  const total = sources.reduce((sum, s) => sum + s.count, 0);
  const maxCount = Math.max(...sources.map((s) => s.count), 1);

  return (
    <div className="acquisition-chart">
      <div className="sources-grid">
        {sources.map((source, index) => {
          const percentage = ((source.count / total) * 100).toFixed(1);
          const barWidth = (source.count / maxCount) * 100;
          return (
            <div key={index} className="source-card">
              <div className="source-name">{source.source}</div>
              <div className="source-bar-container">
                <div className="source-bar" style={{ width: `${barWidth}%` }}>
                  <span className="source-count">{source.count}</span>
                </div>
              </div>
              <div className="source-percentage">{percentage}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerAcquisitionChart;
