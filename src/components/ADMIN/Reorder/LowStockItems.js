import React from 'react';

const LowStockItems = ({ items, onSelect }) => {
  return (
    <div className="admin-card">
      <h3>Low Stock Items</h3>
      {items.map((item) => (
        <button key={item.id} className="admin-list-item" onClick={() => onSelect(item)}>
          <strong>{item.name}</strong>
          <span>Stock: {item.stock}</span>
          <span>Threshold: {item.threshold}</span>
        </button>
      ))}
    </div>
  );
};

export default LowStockItems;
