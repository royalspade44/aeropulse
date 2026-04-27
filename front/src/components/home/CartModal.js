import icons from '../common/icons';

function CartModal({ isOpen, onClose, cart, onRemoveFromCart, onCheckout }) {
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="cart-modal">
      <div className="cart-header">
        <h4>Your Cart ({cart.length} items)</h4>
        <button type="button" className="close-notif" onClick={onClose}>×</button>
      </div>
      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart">Your cart is empty</div>
        ) : (
          <>
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{'\u20b1'}{item.price}</div>
                </div>
                <button
                  type="button"
                  className="cart-item-remove"
                  onClick={() => onRemoveFromCart(item.id)}
                  aria-label="Remove"
                >
                  <img src={icons.broom} alt="" className="inline-icon" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
      {cart.length > 0 && (
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            <span>{'\u20b1'}{getCartTotal()}</span>
          </div>
          <button type="button" className="checkout-btn" onClick={onCheckout}>
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}

export default CartModal;
