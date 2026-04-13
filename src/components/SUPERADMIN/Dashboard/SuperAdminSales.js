import React, { useState, useEffect, useCallback } from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import '../superAdminShared.css';
import { loadOrdersFromStorage } from '../../../domain/purchase/ordersStorage';
import { FULFILLMENT_AWAITING_SUPERADMIN } from '../../../domain/purchase/orderStatuses';
import { approveOrRejectOrder } from '../../../domain/purchase/approveOrderBySuperAdmin';

const SuperAdminSales = () => {
  const [orders, setOrders] = useState([]);
  const [notes, setNotes] = useState({});

  const refresh = useCallback(() => {
    const all = loadOrdersFromStorage();
    setOrders(all.filter((o) => o.fulfillmentStatus === FULFILLMENT_AWAITING_SUPERADMIN));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setNote = (id, value) => {
    setNotes((prev) => ({ ...prev, [id]: value }));
  };

  const approve = (orderId) => {
    const { ok } = approveOrRejectOrder(orderId, 'approve', notes[orderId] || '');
    if (ok) {
      alert('Order approved. Fulfillment can proceed; metrics can ingest this sale (demo).');
      refresh();
    }
  };

  const reject = (orderId) => {
    if (!window.confirm('Reject this order?')) return;
    approveOrRejectOrder(orderId, 'reject', notes[orderId] || '');
    refresh();
  };

  return (
    <SuperAdminLayout
      title="Customer purchases"
      subtitle="Confirm availability, edit if needed, then approve — data feeds business oversight (sales, ads, technician KPIs when wired)"
    >
      <div className="super-card">
        <h3>Awaiting Super Admin ({orders.length})</h3>
        {orders.length === 0 ? (
          <p style={{ color: '#64748b' }}>No pending orders in local storage. Place an order as a customer to see it here.</p>
        ) : (
          <div className="super-list">
            {orders.map((order) => (
              <div key={order.id} className="super-list-item" style={{ display: 'block' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <div>
                    <strong>{order.id}</strong>
                    <p style={{ margin: '4px 0' }}>Total: ₱{order.total?.toLocaleString?.() ?? order.total}</p>
                    <p style={{ margin: '4px 0', fontSize: 13, color: '#64748b' }}>
                      Payment: {order.paymentMethod} · {order.paymentStatus}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: 13, color: '#64748b' }}>
                      Service area: {order.serviceAreaId}
                    </p>
                    <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13 }}>
                      {(order.items || []).map((it) => (
                        <li key={it.id}>
                          {it.name} ×{it.quantity} — ₱{(it.price * it.quantity).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ minWidth: 200 }}>
                    <label htmlFor={`note-${order.id}`} style={{ fontSize: 12, fontWeight: 600 }}>
                      Notes / edits
                    </label>
                    <textarea
                      id={`note-${order.id}`}
                      rows={3}
                      style={{ width: '100%', marginTop: 4, borderRadius: 8, border: '1px solid #e2e8f0', padding: 8 }}
                      placeholder="Stock confirmation, substitutions…"
                      value={notes[order.id] ?? order.superAdminNotes ?? ''}
                      onChange={(e) => setNote(order.id, e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => approve(order.id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          border: 'none',
                          background: '#2563eb',
                          color: '#fff',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => reject(order.id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          background: '#fff',
                          color: '#64748b',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminSales;
