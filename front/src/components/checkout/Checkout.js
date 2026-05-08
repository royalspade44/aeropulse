import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Checkout.css';
import DeliveryAddress from './DeliveryAddress';
import PaymentMethod from './PaymentMethod';
import OrderSummary from './OrderSummary';
import AddAddressModal from './AddAddressModal';
import { DEFAULT_SERVICE_AREA_ID } from '../../domain/purchase/serviceAreas';
import { computePurchaseTotals } from '../../domain/purchase/computePurchaseTotals';
import { resolvePreferredBranch } from '../../domain/branches/branchRouting';
import { buildCustomerOrder } from '../../domain/purchase/buildCustomerOrder';
import { loadOrdersFromStorage, saveOrdersToStorage } from '../../domain/purchase/ordersStorage';
import { PAYMENT_PROCESSING_GATEWAY } from '../../domain/purchase/orderStatuses';
import { consumePostRegistrationCheckoutIntent } from '../../domain/checkout/postRegistrationIntent';
import { apiRequest } from '../../config/api';
import Footer from '../home/Footer';

const isValidCheckoutAddress = (address) => {
  if (!address) return false;
  const hasRequired = address.name?.trim() && address.street?.trim() && address.city?.trim() && address.phone?.trim();
  if (!hasRequired) return false;
  const phoneDigits = String(address.phone || '').replace(/\D/g, '');
  if (!/^09\d{9}$/.test(phoneDigits)) return false;
  if (address.postalCode?.trim() && !/^\d{4}$/.test(address.postalCode.trim())) return false;
  return true;
};

const normalizeAddress = (address = {}) => ({
  id: String(address.id || address._id || ''),
  label: String(address.label || ''),
  type: String(address.type || 'other'),
  name: String(address.name || ''),
  region: String(address.region || ''),
  province: String(address.province || ''),
  barangay: String(address.barangay || ''),
  street: String(address.street || ''),
  city: String(address.city || ''),
  postalCode: String(address.postalCode || ''),
  phone: String(address.phone || ''),
  isDefault: Boolean(address.isDefault)
});

const findBestSelectedAddress = (items, currentId = '') => {
  if (!Array.isArray(items) || items.length === 0) return null;
  if (currentId) {
    const current = items.find((item) => item.id === currentId);
    if (current) return current;
  }
  const defaultAddress = items.find((item) => item.isDefault);
  if (defaultAddress) return defaultAddress;
  return items[0];
};

function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, getCartTotal } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressBusy, setAddressBusy] = useState(false);
  const [addressLoadFailed, setAddressLoadFailed] = useState(false);
  const [discountAmount] = useState(0);
  const [stockIssues, setStockIssues] = useState([]);
  const [stockCheckedAt, setStockCheckedAt] = useState('');

  const assignedBranch = useMemo(() => {
    if (!selectedAddress) return '';
    return resolvePreferredBranch(selectedAddress);
  }, [selectedAddress]);

  const serviceAreaId = useMemo(() => {
    if (!assignedBranch) return DEFAULT_SERVICE_AREA_ID;
    return assignedBranch.toLowerCase();
  }, [assignedBranch]);

  const totals = useMemo(() => {
    const subtotal = getCartTotal();
    return computePurchaseTotals({ subtotal, serviceAreaId, discountAmount });
  }, [getCartTotal, serviceAreaId, discountAmount]);

  const syncAddresses = useCallback((nextAddresses, currentId = '') => {
    const normalized = (nextAddresses || []).map(normalizeAddress);
    setAddresses(normalized);
    setSelectedAddress(findBestSelectedAddress(normalized, currentId || selectedAddress?.id || ''));
    return normalized;
  }, [selectedAddress?.id]);

  const loadAddresses = useCallback(async () => {
    try {
      const response = await apiRequest('/users/addresses');
      setAddressLoadFailed(false);
      return syncAddresses(response.addresses || []);
    } catch (_error) {
      setAddressLoadFailed(true);
      return syncAddresses([]);
    }
  }, [syncAddresses]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const computeStockIssues = useCallback((productsResponse = {}) => {
    const rawProducts = Array.isArray(productsResponse.products) ? productsResponse.products : [];
    const byId = new Map(rawProducts.map((p) => [String(p.id || p._id || ''), Number(p.stock || 0)]));
    const bySku = new Map(rawProducts.map((p) => [String(p.sku || ''), Number(p.stock || 0)]).filter(([sku]) => Boolean(sku)));

    const issues = [];
    for (const item of cart) {
      const idKey = String(item.id || '');
      const skuKey = String(item.model || item.sku || '');
      const available = byId.has(idKey) ? byId.get(idKey) : bySku.has(skuKey) ? bySku.get(skuKey) : null;
      if (available === null) continue;
      const desired = Number(item.quantity || 0);
      const normalizedAvailable = Number.isFinite(available) ? Math.max(0, Math.floor(available)) : 0;
      if (normalizedAvailable <= 0) {
        issues.push({ id: idKey, name: item.name, desired, available: 0, code: 'out_of_stock' });
      } else if (desired > normalizedAvailable) {
        issues.push({ id: idKey, name: item.name, desired, available: normalizedAvailable, code: 'insufficient_stock' });
      }
    }
    return issues;
  }, [cart]);

  const refreshStock = useCallback(async () => {
    try {
      const response = await apiRequest('/products/public');
      setStockIssues(computeStockIssues(response));
      setStockCheckedAt(new Date().toISOString());
      return { ok: true, issues: computeStockIssues(response) };
    } catch (_error) {
      return { ok: false, issues: stockIssues };
    }
  }, [computeStockIssues, stockIssues]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!mounted) return;
      await refreshStock();
    };
    run();
    const pollId = window.setInterval(run, 20000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') run();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      mounted = false;
      window.clearInterval(pollId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshStock]);

  const redirectToAddressForm = useCallback(() => {
    navigate('/profile', {
      state: {
        focusAddressForm: true,
        highlightAddressForm: true,
        highlightSource: 'checkout'
      }
    });
  }, [navigate]);

  const ensureHasAddressBeforeCheckout = useCallback(async () => {
    const latestAddresses = await loadAddresses();
    if (latestAddresses.length > 0) return true;
    alert('No delivery address found. Please add an address to proceed.');
    redirectToAddressForm();
    return false;
  }, [loadAddresses, redirectToAddressForm]);

  const closeAddressModal = useCallback(() => {
    setShowAddressModal(false);
    setEditingAddress(null);
  }, []);

  const handleSaveAddress = useCallback(async (payload) => {
    setAddressBusy(true);
    try {
      if (editingAddress?.id) {
        const response = await apiRequest(`/users/addresses/${editingAddress.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        syncAddresses(response.addresses || [], editingAddress.id);
      } else {
        const response = await apiRequest('/users/addresses', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const normalized = syncAddresses(response.addresses || []);
        const newest = normalized[normalized.length - 1];
        if (newest) setSelectedAddress(findBestSelectedAddress(normalized, newest.id));
      }
      closeAddressModal();
    } catch (error) {
      if (error?.fieldErrors) {
        // Backend validation error with field-level details
        console.error('Address validation errors:', error.fieldErrors);
        // Re-open modal so user can see errors (modal will display them)
      } else {
        alert(error?.message || 'Unable to save address right now.');
      }
    } finally {
      setAddressBusy(false);
    }
  }, [editingAddress?.id, syncAddresses, closeAddressModal]);

  const handleDeleteAddress = useCallback(async (address) => {
    if (!address?.id) return;
    if (!window.confirm('Delete this saved address?')) return;
    setAddressBusy(true);
    try {
      const response = await apiRequest(`/users/addresses/${address.id}`, {
        method: 'DELETE'
      });
      syncAddresses(response.addresses || []);
    } catch (error) {
      alert(error?.message || 'Unable to delete address right now.');
    } finally {
      setAddressBusy(false);
    }
  }, [syncAddresses]);

  const handleSetDefaultAddress = useCallback(async (address) => {
    if (!address?.id) return;
    setAddressBusy(true);
    try {
      const response = await apiRequest(`/users/addresses/${address.id}/default`, {
        method: 'PATCH'
      });
      syncAddresses(response.addresses || [], address.id);
    } catch (error) {
      alert(error?.message || 'Unable to update default address right now.');
    } finally {
      setAddressBusy(false);
    }
  }, [syncAddresses]);

  const handlePlaceOrder = useCallback(async () => {
    const latestStock = await refreshStock();
    if (latestStock.ok && latestStock.issues.length > 0) {
      const message = latestStock.issues
        .map((issue) => `${issue.name}: requested ${issue.desired}, available ${issue.available}`)
        .join('\n');
      alert(`Some items are no longer available.\n\n${message}\n\nPlease update your cart and try again.`);
      return;
    }

    const hasSavedAddress = await ensureHasAddressBeforeCheckout();
    if (!hasSavedAddress) return;

    if (addressLoadFailed) {
      alert('Unable to verify your saved addresses right now. Please try again in a moment.');
      return;
    }
    if (!selectedAddress) {
      alert('Please select a delivery address.');
      return;
    }
    if (!isValidCheckoutAddress(selectedAddress)) {
      alert('Please provide a valid address. Phone must be 11 digits (09XXXXXXXXX) and postal code must be 4 digits.');
      return;
    }

    const fromPostReg = consumePostRegistrationCheckoutIntent();
    const orderId = `ORD-${Date.now()}`;
    const trackingNumber = `TRK-${Math.floor(Math.random() * 1000000000)}`;

    const order = buildCustomerOrder({
      orderId,
      trackingNumber,
      cartItems: cart,
      address: selectedAddress,
      paymentMethod: selectedPayment,
      serviceAreaId,
      totals,
      fromPostRegistrationCheckout: fromPostReg
    });

    try {
      const response = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: order.items,
          addressId: selectedAddress.id,
          address: selectedAddress,
          paymentMethod: selectedPayment,
          total: order.total
        })
      });
      const created = response.order;
      const receiptText = created?.receipt?.receiptNumber
        ? `\nE-Receipt: ${created.receipt.receiptNumber}`
        : '';
      if (order.paymentStatus === PAYMENT_PROCESSING_GATEWAY) {
        alert(
          `Order received (${created.orderCode}).${receiptText}\nWe are processing stock allocation for your branch and reserved this cart for 15 minutes. Complete payment in the ${selectedPayment === 'gcash' ? 'GCash' : 'card'} gateway once checkout approval is ready.`
        );
      } else {
        alert(
          `Order received (${created.orderCode}).${receiptText}\nYour order is now processing in our POS queue and a payment reminder will be sent once dispatch confirms your slot.`
        );
      }
      clearCart();
      navigate('/my-orders');
    } catch (error) {
      const isNetworkIssue = !error?.status;
      if (isNetworkIssue) {
        const orders = loadOrdersFromStorage();
        orders.unshift(order);
        saveOrdersToStorage(orders);
        clearCart();
        navigate('/my-orders');
        alert(`Order received (${orderId}). Saved locally because backend could not be reached.`);
        return;
      }
      alert(error?.message || 'Unable to place order right now. Please review your cart and try again.');
    }
  }, [
    refreshStock,
    ensureHasAddressBeforeCheckout,
    addressLoadFailed,
    selectedAddress,
    cart,
    selectedPayment,
    serviceAreaId,
    totals,
    clearCart,
    navigate
  ]);

  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-header">
          <div className="checkout-header-content">
            <button type="button" className="back-btn" onClick={() => navigate('/shop')}>←</button>
            <h1 className="checkout-title">Checkout</h1>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2>Your cart is empty</h2>
          <button type="button" onClick={() => navigate('/shop')} className="place-order-btn" style={{ width: 'auto', padding: '12px 30px', marginTop: '20px' }}>
            Continue Shopping
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <div className="checkout-header-content">
          <button type="button" className="back-btn" onClick={() => navigate('/shop')}>←</button>
          <h1 className="checkout-title">Checkout</h1>
        </div>
      </div>

      <div className="checkout-main">
        <div className="checkout-left">
          <DeliveryAddress
            addresses={addresses}
            selectedAddress={selectedAddress}
            onSelectAddress={setSelectedAddress}
            onAddAddress={() => {
              setEditingAddress(null);
              setShowAddressModal(true);
            }}
            onEditAddress={(address) => {
              setEditingAddress(address);
              setShowAddressModal(true);
            }}
            onDeleteAddress={handleDeleteAddress}
            onSetDefaultAddress={handleSetDefaultAddress}
            isBusy={addressBusy}
          />

          {assignedBranch && (
            <div className="checkout-branch-assignment">
              <div className="branch-assignment-card">
                <div className="branch-assignment-label">ORDER FULFILLMENT BRANCH</div>
                <div className="branch-assignment-main">
                  <div className="branch-name">{assignedBranch}</div>
                  <div className="branch-location">{selectedAddress?.city || 'City not specified'}</div>
                </div>
                <div className="branch-assignment-note">
                  This order will be fulfilled from the {assignedBranch} branch based on your delivery address.
                </div>
              </div>
            </div>
          )}

          <PaymentMethod
            selectedMethod={selectedPayment}
            onSelectMethod={setSelectedPayment}
            branchHint={assignedBranch ? `This order will be routed from the ${assignedBranch} branch based on the selected delivery address.` : 'The branch assignment will be determined once you choose a delivery address.'}
          />
        </div>

        <OrderSummary
          cart={cart}
          selectedPayment={selectedPayment}
          totals={totals}
          onPlaceOrder={handlePlaceOrder}
          stockIssues={stockIssues}
          stockCheckedAt={stockCheckedAt}
        />
      </div>

      {showAddressModal && (
        <AddAddressModal
          onClose={closeAddressModal}
          onSave={handleSaveAddress}
          initialAddress={editingAddress}
          title={editingAddress ? 'Edit Address' : 'Add New Address'}
          saveLabel={editingAddress ? 'Save Changes' : 'Save Address'}
          isSaving={addressBusy}
        />
      )}
      <Footer />
    </div>
  );
}

export default Checkout;
