import React from 'react';
import './StatsCards.css';

const StatsCards = ({ stats, loading = false }) => {
  const cards = [
    { 
      key: 'totalSales', 
      label: 'Total Sales', 
      prefix: '₱', 
      icon: '💰',
      trend: '+12%',
      trendDirection: 'up'
    },
    { 
      key: 'totalOrders', 
      label: 'Total Orders', 
      prefix: '', 
      icon: '📋',
      trend: '+5%',
      trendDirection: 'up'
    },
    { 
      key: 'lowStockItems', 
      label: 'Low Stock Items', 
      prefix: '', 
      icon: '⚠️',
      trend: '-2%',
      trendDirection: 'down'
    },
    { 
      key: 'activeTechnicians', 
      label: 'Active Technicians', 
      prefix: '', 
      icon: '🔧',
      trend: '0%',
      trendDirection: 'steady'
    }
  ];

  const getTrendIcon = (direction) => {
    if (direction === 'up') return '📈';
    if (direction === 'down') return '📉';
    return '➡️';
  };

  return (
    <div className="stats-grid">
      {cards.map((card, index) => {
        const value = stats?.[card.key] ?? 0;
        const isEmpty = value === 0 && card.key !== 'totalSales';
        
        return (
          <div 
            className={`stat-card ${loading ? 'loading' : ''} ${isEmpty ? 'empty' : ''}`} 
            key={card.key}
          >
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