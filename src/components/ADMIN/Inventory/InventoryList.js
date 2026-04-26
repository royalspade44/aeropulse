import React from 'react';
import { apiRequest } from '../../../config/api';
import './styles.css';

const InventoryList = ({ products, loading, onRefresh }) => {
  const [pendingId, setPendingId] = React.useState('');
  const [rowState, setRowState] = React.useState({});
  const [editingId, setEditingId] = React.useState('');
  const [editForm, setEditForm] = React.useState({ name: '', brand: '', category: '', specs: '', price: '', threshold: '' });

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

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name || '',
      brand: product.brand || '',
      category: product.category || 'split',
      specs: product.specs || '',
      price: String(product.price ?? ''),
      threshold: String(product.threshold ?? ''),
    });
  };

  const saveEdit = async (productId) => {
    try {
      setPendingId(productId);
      await apiRequest(`/products/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...editForm,
          price: Number(editForm.price) || 0,
          threshold: Number(editForm.threshold) || 0,
        }),
      });
      setEditingId('');
      onRefresh?.();
    } catch (error) {
      alert(error.message || 'Unable to update product');
    } finally {
      setPendingId('');
    }
  };

  const removeProduct = async (productId) => {
    const proceed = window.confirm('Remove this item from inventory?');
    if (!proceed) return;
    try {
      setPendingId(productId);
      await apiRequest(`/products/${productId}`, { method: 'DELETE' });
      onRefresh?.();
    } catch (error) {
      alert(error.message || 'Unable to delete product');
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
            <th>Stock Actions</th>
            <th>Item Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                {editingId === product.id ? (
                  <input value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} />
                ) : product.name}
              </td>
              <td>
                {editingId === product.id ? (
                  <input value={editForm.brand} onChange={(e) => setEditForm((prev) => ({ ...prev, brand: e.target.value }))} />
                ) : (product.brand || '-')}
              </td>
              <td>
                {editingId === product.id ? (
                  <select value={editForm.category} onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}>
                    <option value="split">Split</option>
                    <option value="window">Window</option>
                    <option value="floor">Floor Mounted</option>
                  </select>
                ) : (product.category || '-')}
              </td>
              <td>
                {editingId === product.id ? (
                  <input value={editForm.specs} onChange={(e) => setEditForm((prev) => ({ ...prev, specs: e.target.value }))} placeholder="e.g. 1.5HP" />
                ) : (product.specs || '-')}
              </td>
              <td>{product.sku}</td>
              <td>{product.stock}</td>
              <td>
                {editingId === product.id ? (
                  <input type="number" min="0" value={editForm.price} onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))} style={{ width: 90 }} />
                ) : `PHP ${product.price}`}
              </td>
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
              <td style={{ minWidth: 220 }}>
                {editingId === product.id ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      value={editForm.threshold}
                      type="number"
                      min="0"
                      onChange={(e) => setEditForm((prev) => ({ ...prev, threshold: e.target.value }))}
                      placeholder="Threshold"
                      style={{ width: 90 }}
                    />
                    <button type="button" onClick={() => saveEdit(product.id)} disabled={pendingId === product.id}>
                      {pendingId === product.id ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setEditingId('')}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button type="button" onClick={() => startEdit(product)} disabled={pendingId === product.id}>Edit</button>
                    <button type="button" onClick={() => removeProduct(product.id)} disabled={pendingId === product.id}>Delete</button>
                  </div>
                )}
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
