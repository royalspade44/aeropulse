import React from 'react';

/**
 * SalesAnalyticsChart - Display sales trends (daily, monthly, quarterly)
 */
const SalesAnalyticsChart = ({ period = 'monthly', data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="analytics-chart">
        <p>No data available</p>
      </div>
    );
  }

  // Find min and max for scaling
  const maxSale = Math.max(...data.map((d) => d.sales || d.monthly_sales || 0), 1);
  const scale = 100 / maxSale;

  const getLabel = (item) => {
    if (item.date) return new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (item.month) return new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (item.quarter) return item.quarter;
    return '';
  };

  return (
    <div className="analytics-chart">
      <div className="chart-bars">
        {data.slice(0, 30).map((item, index) => {
          const sales = item.sales || item.monthly_sales || 0;
          const height = Math.max(5, sales * scale);
          return (
            <div key={index} className="chart-bar-wrapper">
              <div className="chart-bar" style={{ height: `${height}%` }} title={`₱${sales.toLocaleString()}`}>
                <span className="bar-value">₱{(sales / 1000).toFixed(1)}k</span>
              </div>
              <div className="chart-label">{getLabel(item)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SalesAnalyticsChart;
