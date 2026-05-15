import React from 'react';
import { apiRequest } from '../../../config/api';
import { useUser } from '../../../context/UserContext';
import { appendAuditLog } from '../../../utils/auditLogs';
import './styles.css';

const InventoryList = ({ products, loading, onRefresh, branch, onRequestChange, getProductStock }) => {
  const { user } = useUser();
  const [pendingId, setPendingId] = React.useState('');
  const [rowState, setRowState] = React.useState({});

  const getRowState = (productId) => rowState[productId] || { quantity: '' };
  const setRowValue = (productId, next) => {
    setRowState((prev) => ({
      ...prev,
      [productId]: { ...getRowState(productId), ...next },
    }));
  };

  const getStockDisplay = (product) => {
    if (getProductStock) {
      return getProductStock(product);
    }
    return product.stock || 0;
  };

  const updateStock = async (productId) => {
    const { quantity } = getRowState(productId);
    const qty = Number(quantity);
    if (!qty || qty <= 0) return;
    try {
      setPendingId(productId);
      await apiRequest(`/products/${productId}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'add',
          quantity: qty,
        }),
      });
      appendAuditLog({
        user: user?.email || user?.name || 'admin',
        action: 'update_inventory_stock',
        details: `Product ${productId} stock action=add qty=${qty}`,
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
            <th>Brand</th>
            <th>Category</th>
            <th>HP / Specs</th>
            <th>SKU</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Add Stock</th>
            {onRequestChange && <th>Manager Actions</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.brand || '-'}</td>
              <td>{product.category || '-'}</td>
              <td>{product.specs || '-'}</td>
              <td>{product.sku}</td>
              <td className="stock-cell">
                <span className="stock-badge">{getStockDisplay(product)}</span>
              </td>
              <td>PHP {product.price}</td>
              <td style={{ minWidth: 210 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="number"
                    min="1"
                    value={getRowState(product.id).quantity}
                    onChange={(event) => setRowValue(product.id, { quantity: event.target.value })}
                    placeholder="Qty"
                    style={{ width: 70 }}
                  />
                  <button type="button" onClick={() => updateStock(product.id)} disabled={pendingId === product.id}>
                    {pendingId === product.id ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </td>

              {onRequestChange && (
                <td>
                  <button 
                    type="button" 
                    className="btn-request-change"
                    onClick={() => onRequestChange(product)}
                    disabled={pendingId === product.id}
                  >
                    Request Change
                  </button>
                </td>
              )}
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
