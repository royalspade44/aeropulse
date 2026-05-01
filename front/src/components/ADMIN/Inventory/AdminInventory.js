import React, { useEffect, useState } from 'react';
import AdminLayout from '../Common/AdminLayout';
import AddProduct from './AddProduct';
import InventoryList from './InventoryList';
import InventoryChangeRequestModal from './InventoryChangeRequestModal';
import PendingApprovalsModal from './PendingApprovalsModal';
import RestockOrderModal from './RestockOrderModal';
import IncomingRestockModal from './IncomingRestockModal';
import { apiRequest } from '../../../config/api';
import { useUser } from '../../../context/UserContext';
import { ACTIVE_BRANCH_KEY } from '../../../domain/branches/branches';
import '../adminShared.css';
import './styles.css';

const AdminInventory = () => {
  const { profile } = useUser() || {};
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeBranch, setActiveBranch] = useState('');

  // Modal states
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [showPendingApprovals, setShowPendingApprovals] = useState(false);
  const [showRestockOrder, setShowRestockOrder] = useState(false);
  const [showIncomingRestock, setShowIncomingRestock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [branchFilter, setBranchFilter] = useState('');

  const BRANCHES = ['Bulacan', 'Cavite', 'Laguna', 'Bataan', 'Pangasinan', 'Ilocos'];
  const isOwner = profile?.role === 'superadmin';
  const isManager = profile?.role === 'admin';

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await apiRequest('/products');
      setProducts(result.products || []);
      const selected = localStorage.getItem(ACTIVE_BRANCH_KEY) || '';
      setActiveBranch(selected);
      if (!branchFilter) setBranchFilter(selected);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRequestChange = (product) => {
    setSelectedProduct(product);
    setShowChangeRequest(true);
  };

  const filteredProducts = branchFilter
    ? products.filter((p) => !p.branchStock || p.branchStock[branchFilter] !== undefined)
    : products;

  const getProductStock = (product) => {
    if (!product.branchStock) return product.stock || 0;
    return product.branchStock[branchFilter] !== undefined ? product.branchStock[branchFilter] : 0;
  };

  return (
    <AdminLayout 
      title="Inventory Management" 
      subtitle={`Track and update stock${activeBranch ? ` - ${activeBranch} branch` : ''}`}
    >
      {/* Owner/Manager Action Buttons */}
      {(isOwner || isManager) && (
        <div className="inventory-toolbar">
          {isManager && (
            <>
              <button 
                className="btn-action-primary"
                onClick={() => setShowPendingApprovals(true)}
              >
                📋 Pending Approvals
              </button>
              <button 
                className="btn-action-secondary"
                onClick={() => setShowIncomingRestock(true)}
              >
                📦 Incoming Restock
              </button>
            </>
          )}
          {isOwner && (
            <>
              <button 
                className="btn-action-secondary"
                onClick={() => setShowRestockOrder(true)}
              >
                ➕ Create Restock Order
              </button>
              <button 
                className="btn-action-secondary"
                onClick={() => setShowPendingApprovals(true)}
              >
                📋 Review Requests
              </button>
            </>
          )}
        </div>
      )}

      {/* Branch Filter */}
      {activeBranch && (
        <div className="branch-filter-section">
          <label>Filter by Branch:</label>
          <select 
            value={branchFilter} 
            onChange={(e) => setBranchFilter(e.target.value)}
            className="branch-select"
          >
            <option value="">All Branches</option>
            {BRANCHES.map((branch) => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>
      )}

      <div className="admin-grid-2">
        <AddProduct onCreated={() => load()} />
        <div>
          {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
          <InventoryList 
            products={filteredProducts} 
            loading={loading} 
            onRefresh={load}
            branch={branchFilter}
            onRequestChange={isManager ? handleRequestChange : null}
            getProductStock={getProductStock}
          />
        </div>
      </div>

      {/* Modals */}
      {isManager && (
        <>
          <InventoryChangeRequestModal
            isOpen={showChangeRequest}
            product={selectedProduct}
            currentStock={selectedProduct ? getProductStock(selectedProduct) : 0}
            onClose={() => {
              setShowChangeRequest(false);
              setSelectedProduct(null);
            }}
            onSuccess={() => {
              setShowChangeRequest(false);
              setSelectedProduct(null);
              load();
            }}
          />
          <IncomingRestockModal
            isOpen={showIncomingRestock}
            onClose={() => setShowIncomingRestock(false)}
            onRefresh={() => load()}
          />
        </>
      )}

      {isOwner && (
        <>
          <PendingApprovalsModal
            isOpen={showPendingApprovals}
            onClose={() => setShowPendingApprovals(false)}
            onRefresh={() => load()}
          />
          <RestockOrderModal
            isOpen={showRestockOrder}
            onClose={() => setShowRestockOrder(false)}
            onSuccess={() => {
              setShowRestockOrder(false);
              load();
            }}
          />
        </>
      )}
    </AdminLayout>
  );
};

export default AdminInventory;
