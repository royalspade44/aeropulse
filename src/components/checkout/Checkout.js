import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Checkout.css';
import DeliveryAddress from './DeliveryAddress';
import PaymentMethod from './PaymentMethod';
import OrderSummary from './OrderSummary';
import AddAddressModal from './AddAddressModal';
import { getStoredServiceAreaId } from '../../domain/purchase/serviceAreaStorage';
import { DEFAULT_SERVICE_AREA_ID } from '../../domain/purchase/serviceAreas';
import { computePurchaseTotals } from '../../domain/purchase/computePurchaseTotals';
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

function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, getCartTotal } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [discountAmount] = useState(0);

  const serviceAreaId = getStoredServiceAreaId() || DEFAULT_SERVICE_AREA_ID;

  const totals = useMemo(() => {
    const subtotal = getCartTotal();
    return computePurchaseTotals({ subtotal, serviceAreaId, discountAmount });
  }, [getCartTotal, serviceAreaId, discountAmount]);

  useEffect(() => {
    const savedAddresses = localStorage.getItem('addresses');
    if (savedAddresses) {
      const parsed = JSON.parse(savedAddresses);
      setAddresses(parsed);
      if (parsed.length > 0) setSelectedAddress(parsed[0]);
    }
  }, []);

  const handleAddAddress = useCallback((newAddress) => {
    const updatedAddresses = [...addresses, newAddress];
    setAddresses(updatedAddresses);
    localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
    setSelectedAddress(newAddress);
    setShowAddressModal(false);
  }, [addresses]);

  const handlePlaceOrder = useCallback(async () => {
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
  }, [selectedAddress, cart, selectedPayment, serviceAreaId, totals, clearCart, navigate]);

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
            onAddAddress={() => setShowAddressModal(true)}
          />
          <PaymentMethod
            selectedMethod={selectedPayment}
            onSelectMethod={setSelectedPayment}
          />
        </div>

        <OrderSummary
          cart={cart}
          selectedPayment={selectedPayment}
          totals={totals}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>

      {showAddressModal && (
        <AddAddressModal
          onClose={() => setShowAddressModal(false)}
          onSave={handleAddAddress}
        />
      )}
      <Footer />
    </div>
  );
}

export default Checkout;
