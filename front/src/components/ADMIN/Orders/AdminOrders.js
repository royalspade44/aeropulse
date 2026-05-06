import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../Common/AdminLayout';
import { apiRequest } from '../../../config/api';
import { useUser } from '../../../context/UserContext';
import { appendAuditLog } from '../../../utils/auditLogs';
import './AdminOrders.css';

const statusActionMap = {
  to_pay: { label: 'Approve Payment', action: 'approve' },
  to_deliver: { label: 'Mark Dispatched', action: 'dispatch' },
  to_install: { label: 'Mark Complete', action: 'complete' }
};

const AdminOrders = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState('');

  const loadOrders = async () => {
    setError('');
    try {
      const response = await apiRequest('/orders');
      setOrders(response.orders || []);
    } catch (e) {
      setError(e.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const pendingOrders = useMemo(() => orders, [orders]);

  const handleProcess = async (order) => {
    const config = statusActionMap[order.workflowStatus];
    if (!config) return;
    setProcessingId(order.id);
    try {
      await apiRequest(`/orders/${order.id}/process`, {
        method: 'PATCH',
        body: JSON.stringify({ action: config.action })
      });
      appendAuditLog({
        user: user?.email || user?.name || 'admin',
        action: 'change_order_status',
        details: `Order ${order.orderCode || order.id}: ${order.workflowStatus} -> ${config.action}`,
      });
      await loadOrders();
    } catch (e) {
      alert(e.message || 'Unable to process order.');
    } finally {
      setProcessingId('');
    }
  };

  return (
    <AdminLayout title="Customer Orders" subtitle="Review and process customer checkout requests">
      <div className="admin-orders-page">
        {loading ? <p>Loading orders...</p> : null}
        {error ? <p className="admin-orders-error">{error}</p> : null}
        {!loading && pendingOrders.length === 0 ? <p>No customer orders.</p> : null}
        <div className="admin-orders-list">
          {pendingOrders.map((order) => {
            const actionConfig = statusActionMap[order.workflowStatus];
            return (
              <article key={order.id} className="admin-order-card">
                <div className="admin-order-row">
                  <h3>{order.orderCode}</h3>
                  <span className={`admin-order-status status-${order.workflowStatus}`}>{order.workflowLabel}</span>
                </div>
                <p className="admin-order-meta">
                  Customer: {order.customerName || 'N/A'} | Branch: {order.stockSourceBranch || 'N/A'}
                </p>
                <p className="admin-order-meta">
                  Amount: PHP {Number(order.totalAmount || 0).toLocaleString()} | Payment: {order.paymentMethod || 'N/A'}
                </p>
                <ul className="admin-order-items">
                  {(order.items || []).map((item, idx) => (
                    <li key={`${order.id}-${idx}`}>{item.name} x{item.quantity}</li>
                  ))}
                </ul>
                {actionConfig ? (
                  <button
                    type="button"
                    className="admin-process-btn"
                    onClick={() => handleProcess(order)}
                    disabled={processingId === order.id}
                  >
                    {processingId === order.id ? 'Processing...' : actionConfig.label}
                  </button>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
