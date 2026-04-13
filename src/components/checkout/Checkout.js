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
import { PAYMENT_PENDING_GATEWAY } from '../../domain/purchase/orderStatuses';
import { consumePostRegistrationCheckoutIntent } from '../../domain/checkout/postRegistrationIntent';

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

  const handlePlaceOrder = useCallback(() => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
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

    const orders = loadOrdersFromStorage();
    orders.unshift(order);
    saveOrdersToStorage(orders);

    if (order.paymentStatus === PAYMENT_PENDING_GATEWAY) {
      alert(
        `Order submitted (${orderId}). Super Admin will confirm availability. After approval, complete payment in the ${selectedPayment === 'gcash' ? 'GCash' : 'card'} gateway (demo).`
      );
    } else {
      alert(
        `Order submitted (${orderId}). Awaiting Super Admin approval. Invoice will be sent to your confirmed email when the backend is connected.`
      );
    }

    clearCart();
    navigate('/my-orders');
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
    </div>
  );
}

export default Checkout;
