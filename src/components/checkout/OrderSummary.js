import icons from '../common/icons';
import PurchaseCostBreakdown from './PurchaseCostBreakdown';

function OrderSummary({
  cart,
  selectedPayment,
  totals,
  onPlaceOrder
}) {
  return (
    <div className="checkout-section order-summary">
      <h2 style={{ marginBottom: '20px' }}>Order Summary</h2>
      <div className="summary-items">
        {cart.map((item) => (
          <div key={item.id} className="summary-item">
            <div className="summary-item-image">
              <img src={icons.temperatureFrigid} alt="" className="inline-icon" />
            </div>
            <div className="summary-item-details">
              <div className="summary-item-name">{item.name}</div>
              <div className="summary-item-price">₱{item.price.toLocaleString()} each</div>
              <div className="summary-item-quantity">×{item.quantity}</div>
            </div>
            <div style={{ fontWeight: 'bold', color: '#1E88E5' }}>
              ₱{(item.price * item.quantity).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <PurchaseCostBreakdown totals={totals} />

      <div className="summary-total">
        <span>Total due</span>
        <span>₱{totals.total.toLocaleString()}</span>
      </div>

      <p className="checkout-flow-note">
        Orders are sent to <strong>Super Admin</strong> for stock confirmation and edits before fulfillment.
        {selectedPayment === 'gcash' || selectedPayment === 'credit'
          ? ' You will complete payment in the gateway after approval where applicable.'
          : ' Payment stays pending for COD or pay-on-installation until the milestone is reached.'}
      </p>

      <button type="button" className="place-order-btn" onClick={onPlaceOrder}>
        Place order
      </button>
    </div>
  );
}

export default OrderSummary;
