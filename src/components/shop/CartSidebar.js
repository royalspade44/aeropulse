import { useNavigate } from 'react-router-dom';
import icons from '../common/icons';

function productThumbIcon(item) {
  if (item?.category === 'window') return icons.windowFrame;
  if (item?.category === 'floor') return icons.houseChimney;
  return icons.temperatureFrigid;
}

function CartSidebar({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onCheckout, getCartTotal }) {
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="cart-header">
        <h3>Your Cart ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} items)</h3>
        <button className="close-cart" onClick={onClose}>×</button>
      </div>
      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart">Your cart is empty</div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                <img src={productThumbIcon(item)} alt="" className="inline-icon inline-icon--lg" />
              </div>
              <div className="cart-item-details">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">₱{item.price.toLocaleString()}</div>
                <div className="cart-item-quantity">
                  <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}>-</button>
                  <span>{item.quantity || 1}</span>
                  <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}>+</button>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => onRemoveItem(item.id)}
                    style={{ background: '#f44336', color: 'white', marginLeft: '10px' }}
                    aria-label="Remove item"
                  >
                    <img src={icons.broom} alt="" className="inline-icon" style={{ filter: 'brightness(0) invert(1)' }} />
                  </button>
                </div>
              </div>
              <div className="cart-item-subtotal" style={{ fontWeight: 'bold', color: '#1E88E5' }}>
                ₱{(item.price * (item.quantity || 1)).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
      {cart.length > 0 && (
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            <span>₱{getCartTotal().toLocaleString()}</span>
          </div>
          <button className="checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}

export default CartSidebar;