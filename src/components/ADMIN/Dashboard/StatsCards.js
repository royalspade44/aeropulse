import React from 'react';
import './StatsCards.css';
import icons from '../../common/icons';

const StatsCards = ({ stats, loading = false }) => {
  const cards = [
    {
      key: 'totalSales',
      label: 'Total Sales',
      prefix: '\u20b1',
      icon: icons.cartShoppingFast,
      trend: '+12%',
      trendDirection: 'up'
    },
    {
      key: 'totalOrders',
      label: 'Total Orders',
      prefix: '',
      icon: icons.clipboardList,
      trend: '+5%',
      trendDirection: 'up'
    },
    {
      key: 'lowStockItems',
      label: 'Low Stock Items',
      prefix: '',
      icon: icons.diamondExclamation,
      trend: '-2%',
      trendDirection: 'down'
    },
    {
      key: 'activeTechnicians',
      label: 'Active Technicians',
      prefix: '',
      icon: icons.tools,
      trend: '0%',
      trendDirection: 'steady'
    }
  ];

  const getTrendIcon = (direction) => {
    if (direction === 'up') return '\u2191';
    if (direction === 'down') return '\u2193';
    return '\u2192';
  };

  return (
    <div className="stats-grid">
      {cards.map((card) => {
        const value = stats?.[card.key] ?? 0;
        const isEmpty = value === 0 && card.key !== 'totalSales';

        return (
          <div
            className={`stat-card ${loading ? 'loading' : ''} ${isEmpty ? 'empty' : ''}`}
            key={card.key}
          >
            <img src={card.icon} alt="" className="stat-watermark" />
            <div className="stat-info">
              <h3>{card.label}</h3>
              <p>
                {card.prefix}
                {typeof value === 'number'
                  ? value.toLocaleString()
                  : value}
              </p>
              {!loading && card.trend && (
                <div className={`stat-trend ${card.trendDirection}`}>
                  <span>{getTrendIcon(card.trendDirection)}</span>
                  <span>{card.trend}</span>
                  <span>vs last month</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
