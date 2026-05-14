import { useState } from 'react';
import icons from '../common/icons';

function CartModal({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onCheckout, getCartTotal }) {
  const [selectedItems, setSelectedItems] = useState(new Set());

  const handleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cart.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cart.map(item => item.id)));
    }
  };

  const handleBulkDelete = () => {
    selectedItems.forEach(id => onRemoveItem(id));
    setSelectedItems(new Set());
  };

  const getItemSubtotal = (item) => item.price * (item.quantity || 1);

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
            <div className="cart-bulk-actions">
              <label className="cart-select-all">
                <input
                  type="checkbox"
                  checked={selectedItems.size === cart.length && cart.length > 0}
                  onChange={handleSelectAll}
                />
                Select All
              </label>
              {selectedItems.size > 0 && (
                <button type="button" className="cart-bulk-delete" onClick={handleBulkDelete}>
                  Delete Selected ({selectedItems.size})
                </button>
              )}
            </div>
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                  />
                </div>
                <div className="cart-item-image">
                  {item.icon}
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-brand">{item.brand}</div>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-specs">{item.specs}</div>
                  <div className="cart-item-price">₱{item.price.toLocaleString()}</div>
                  <div className="cart-item-quantity">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                      disabled={(item.quantity || 1) <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity || 1}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-item-subtotal">
                    Subtotal: ₱{getItemSubtotal(item).toLocaleString()}
                  </div>
                </div>
                <button
                  type="button"
                  className="cart-item-remove"
                  onClick={() => onRemoveItem(item.id)}
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
            <span>₱{getCartTotal().toLocaleString()}</span>
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
