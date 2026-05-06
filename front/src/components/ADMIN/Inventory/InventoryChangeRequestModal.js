import React, { useState } from 'react';
import { apiRequest } from '../../../config/api';
import './InventoryChangeRequestModal.css';

const InventoryChangeRequestModal = ({ isOpen, product, currentStock, onClose, onSuccess }) => {
  const [requestedStock, setRequestedStock] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!requestedStock || !reason.trim()) {
      setError('Both requested stock and reason are required');
      return;
    }

    const newStock = Number(requestedStock);
    if (isNaN(newStock) || newStock < 0) {
      setError('Requested stock must be a valid positive number');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/inventory-change-requests', {
        method: 'POST',
        body: JSON.stringify({
          productId: product._id || product.id,
          currentStock: Number(currentStock),
          requestedStock: newStock,
          reason: reason.trim(),
        }),
      });

      alert('Request submitted successfully');
      setRequestedStock('');
      setReason('');
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request Inventory Change</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Product</label>
            <p className="product-info">{product.name}</p>
            <small>SKU: {product.sku}</small>
          </div>

          <div className="form-group">
            <label>Current Stock</label>
            <p className="current-stock">{currentStock} units</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="requestedStock">Requested New Stock *</label>
              <input
                id="requestedStock"
                type="number"
                min="0"
                value={requestedStock}
                onChange={(e) => setRequestedStock(e.target.value)}
                placeholder="Enter new stock quantity (must exceed current stock)"
                className="form-input"
              />
              <small>Requested stock must be greater than the current branch stock.</small>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason for Change *</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you need this change..."
                rows="4"
                className="form-textarea"
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryChangeRequestModal;
