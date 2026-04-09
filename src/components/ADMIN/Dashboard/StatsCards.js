import React from 'react';

const StatsCards = ({ stats }) => {
  const cards = [
    { key: 'totalSales', label: 'Total Sales', prefix: 'PHP ' },
    { key: 'totalOrders', label: 'Total Orders' },
    { key: 'lowStockItems', label: 'Low Stock Items' },
    { key: 'activeTechnicians', label: 'Active Technicians' }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div className="stat-card" key={card.key}>
          <div className="stat-info">
            <h3>{card.label}</h3>
            <p>
              {card.prefix || ''}
              {stats?.[card.key] ?? 0}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
