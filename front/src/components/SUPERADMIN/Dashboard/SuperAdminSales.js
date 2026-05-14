import React, { useState, useEffect, useCallback } from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import { apiRequest } from '../../../config/api';
import { BRANCHES } from '../../../domain/branches/branches';
import '../superAdminShared.css';

const PROCESS_STAGE_LABELS = {
  to_pay: 'Pending',
  to_deliver: 'To be completed',
  to_install: 'To be completed',
  complete: 'Completed',
  cancelled: 'Cancelled',
};

const getProcessStage = (workflowStatus = '') => PROCESS_STAGE_LABELS[workflowStatus] || 'Unknown';

const formatAmount = (amount) => {
  if (amount === undefined || amount === null) return '0';
  return Number(amount || 0).toLocaleString();
};

const SuperAdminSales = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest('/orders');
      setOrders(Array.isArray(result.orders) ? result.orders : []);
    } catch (err) {
      setError(err.message || 'Unable to load branch sales.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const branchSummary = orders.reduce((summary, order) => {
    const branch = String(order.stockSourceBranch || order.customerBranch || 'Unknown').trim();
    const stage = getProcessStage(order.workflowStatus);
    if (!summary[branch]) {
      summary[branch] = {
        branch,
        pending: 0,
        toBeCompleted: 0,
        completed: 0,
        cancelled: 0,
        total: 0,
        orders: [],
      };
    }
    summary[branch].total += 1;
    summary[branch].orders.push(order);
    if (stage === 'Pending') summary[branch].pending += 1;
    else if (stage === 'To be completed') summary[branch].toBeCompleted += 1;
    else if (stage === 'Completed') summary[branch].completed += 1;
    else if (stage === 'Cancelled') summary[branch].cancelled += 1;
    return summary;
  }, {});

  const branchList = Object.values(branchSummary).sort((a, b) => b.total - a.total);
  const fullBranchList = BRANCHES.map((branchName) => branchList.find((branch) => branch.branch === branchName) || {
    branch: branchName,
    pending: 0,
    toBeCompleted: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
    orders: [],
  });

  const visibleBranchList = selectedBranch === 'All'
    ? fullBranchList
    : fullBranchList.filter((branch) => branch.branch === selectedBranch);

  const totalPending = orders.filter((order) => getProcessStage(order.workflowStatus) === 'Pending').length;
  const totalToBeCompleted = orders.filter((order) => getProcessStage(order.workflowStatus) === 'To be completed').length;
  const totalCompleted = orders.filter((order) => getProcessStage(order.workflowStatus) === 'Completed').length;
  const totalCancelled = orders.filter((order) => getProcessStage(order.workflowStatus) === 'Cancelled').length;

  return (
    <SuperAdminLayout
      title="Processing Sales"
      subtitle="Branch sales overview with pending, to-be-completed, and completed order stages."
    >
      <div className="super-grid">
        <div className="super-card">
          <h3>Pending</h3>
          <strong>{totalPending}</strong>
        </div>
        <div className="super-card">
          <h3>To be completed</h3>
          <strong>{totalToBeCompleted}</strong>
        </div>
        <div className="super-card">
          <h3>Completed</h3>
          <strong>{totalCompleted}</strong>
        </div>
        <div className="super-card">
          <h3>Branches</h3>
          <strong>{BRANCHES.length}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '18px 0 8px' }}>
        <button
          type="button"
          onClick={() => setSelectedBranch('All')}
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            border: selectedBranch === 'All' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: selectedBranch === 'All' ? '#eff6ff' : '#fff',
            color: selectedBranch === 'All' ? '#1d4ed8' : '#334155',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          All branches
        </button>
        {fullBranchList.map((branchData) => (
          <button
            key={branchData.branch}
            type="button"
            onClick={() => setSelectedBranch(branchData.branch)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: selectedBranch === branchData.branch ? '1px solid #2563eb' : '1px solid #cbd5e1',
              background: selectedBranch === branchData.branch ? '#eff6ff' : '#fff',
              color: selectedBranch === branchData.branch ? '#1d4ed8' : '#334155',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {branchData.branch} ({branchData.total})
          </button>
        ))}
      </div>

      {error ? <p style={{ color: '#d14343', marginBottom: 16 }}>{error}</p> : null}
      {loading ? <p>Loading branch sales...</p> : null}

      {!loading && orders.length === 0 ? (
        <p style={{ color: '#64748b' }}>No branch sales were found. Verify that supervisor access is active and orders exist in the backend.</p>
      ) : null}

      <div className="super-list">
        {visibleBranchList.map((branchData) => (
          <section key={branchData.branch} className="super-list-item" style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ margin: 0 }}>{branchData.branch}</h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Total orders: {branchData.total}</p>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: '#2563eb', fontWeight: 600 }}>Pending {branchData.pending}</span>
                <span style={{ color: '#ea580c', fontWeight: 600 }}>To be completed {branchData.toBeCompleted}</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>Completed {branchData.completed}</span>
                {branchData.cancelled > 0 ? <span style={{ color: '#9f1239', fontWeight: 600 }}>Cancelled {branchData.cancelled}</span> : null}
              </div>
              {branchData.pending === 0 ? (
                <p style={{ margin: '10px 0 0', color: '#475569', fontSize: 13 }}>
                  No pending sales for this branch.
                </p>
              ) : null}
            </div>
            <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
              {branchData.orders.length === 0 ? (
                <p style={{ color: '#64748b', padding: 14, background: '#f8fafc', borderRadius: 12 }}>
                  No branch sales were found for {branchData.branch}.
                </p>
              ) : (
                branchData.orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <strong>{order.orderCode || order.id}</strong>
                        <p style={{ margin: '4px 0', color: '#475569', fontSize: 13 }}>Customer: {order.customerName || 'N/A'}</p>
                      </div>
                      <span
                        style={{
                          padding: '6px 10px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background:
                            getProcessStage(order.workflowStatus) === 'Pending'
                              ? '#fde68a'
                              : getProcessStage(order.workflowStatus) === 'To be completed'
                                ? '#fed7aa'
                                : getProcessStage(order.workflowStatus) === 'Completed'
                                  ? '#bbf7d0'
                                  : '#fda4af',
                          color:
                            getProcessStage(order.workflowStatus) === 'Pending'
                              ? '#92400e'
                              : getProcessStage(order.workflowStatus) === 'To be completed'
                                ? '#9a3412'
                                : getProcessStage(order.workflowStatus) === 'Completed'
                                  ? '#166534'
                                  : '#881337',
                        }}
                      >
                        {getProcessStage(order.workflowStatus)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10, color: '#475569', fontSize: 13 }}>
                      <span>Amount: ₱{formatAmount(order.totalAmount || order.total || 0)}</span>
                      <span>Payment: {order.paymentMethod || 'N/A'}</span>
                      <span>Order status: {order.workflowLabel || order.workflowStatus || 'N/A'}</span>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 13, color: '#475569', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      <span>Customer branch: {order.customerBranch || 'N/A'}</span>
                      <span>Stock branch: {order.stockSourceBranch || 'N/A'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminSales;
