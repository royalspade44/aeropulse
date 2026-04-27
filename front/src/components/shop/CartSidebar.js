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

      {/* Header */}
      <div className="cart-sidebar-header">
        <h3>Your Cart ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} items)</h3>
        <button className="close-cart" onClick={onClose}>×</button>
      </div>

      {/* Items */}
      <div className="cart-items" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280', fontSize: '14px' }}>
            Your cart is empty
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px' }}>

              {/* Thumb */}
              <div style={{ width: '44px', height: '44px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={productThumbIcon(item)} alt="" className="inline-icon inline-icon--lg" />
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                  ₱{item.price.toLocaleString()} each
                </div>

                {/* Quantity controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    className="qty-btn"
                    onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                    style={{ width: '24px', height: '24px', border: '1px solid #e5e7eb', background: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >−</button>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1f2937', minWidth: '16px', textAlign: 'center' }}>
                    {item.quantity || 1}
                  </span>
                  <button
                    className="qty-btn"
                    onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                    style={{ width: '24px', height: '24px', border: '1px solid #e5e7eb', background: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >+</button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    aria-label="Remove item"
                    style={{ width: '24px', height: '24px', border: '1px solid #fca5a5', background: '#fef2f2', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '4px' }}
                  >
                    <img src={icons.broom} alt="" className="inline-icon" style={{ width: '13px', height: '13px', filter: 'invert(27%) sepia(90%) saturate(700%) hue-rotate(330deg)' }} />
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb', flexShrink: 0, letterSpacing: '-0.02em' }}>
                ₱{(item.price * (item.quantity || 1)).toLocaleString()}
              </div>

            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {cart.length > 0 && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Total:</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb', letterSpacing: '-0.03em' }}>
              ₱{getCartTotal().toLocaleString()}
            </span>
          </div>
          <button
            className="checkout-btn"
            onClick={handleCheckout}
            style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', letterSpacing: '0.01em' }}
          >
            Proceed to Checkout
          </button>
        </div>
      )}

    </div>
  );
}

export default CartSidebar;