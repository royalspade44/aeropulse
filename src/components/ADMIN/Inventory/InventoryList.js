import React from 'react';
import { apiRequest } from '../../../config/api';
import './styles.css';

const InventoryList = ({ products, loading, onRefresh }) => {
  const [pendingId, setPendingId] = React.useState('');
  const [rowState, setRowState] = React.useState({});

  const getRowState = (productId) => rowState[productId] || { action: 'add', quantity: '' };
  const setRowValue = (productId, next) => {
    setRowState((prev) => ({
      ...prev,
      [productId]: { ...getRowState(productId), ...next },
    }));
  };

  const updateStock = async (productId) => {
    const { action, quantity } = getRowState(productId);
    if (!quantity) return;
    try {
      setPendingId(productId);
      await apiRequest(`/products/${productId}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({
          action,
          quantity: Number(quantity) || 0,
        }),
      });
      setRowValue(productId, { quantity: '' });
      onRefresh?.();
    } catch (error) {
      alert(error.message || 'Unable to update stock');
    } finally {
      setPendingId('');
    }
  };

  return (
    <div className="admin-card">
      <h3>Inventory List</h3>
      {loading ? (
        <p>Loading…</p>
      ) : null}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Stock Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>{product.stock}</td>
              <td>PHP {product.price}</td>
              <td style={{ minWidth: 210 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select value={getRowState(product.id).action} onChange={(event) => setRowValue(product.id, { action: event.target.value })}>
                    <option value="add">Add</option>
                    <option value="remove">Remove</option>
                    <option value="set">Set</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={getRowState(product.id).quantity}
                    onChange={(event) => setRowValue(product.id, { quantity: event.target.value })}
                    placeholder="Qty"
                    style={{ width: 70 }}
                  />
                  <button type="button" onClick={() => updateStock(product.id)} disabled={pendingId === product.id}>
                    {pendingId === product.id ? 'Saving...' : 'Apply'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={onRefresh} style={{ marginTop: 10 }}>
        Refresh
      </button>
    </div>
  );
};

export default InventoryList;
