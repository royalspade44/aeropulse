import { useState } from 'react';
import icons from '../common/icons';

function productPlaceholderIcon(product) {
  if (product?.category === 'window') return icons.windowFrame;
  if (product?.category === 'floor') return icons.houseChimney;
  return icons.temperatureFrigid;
}

function ModalProductImage({ product }) {
  const [broken, setBroken] = useState(false);
  const placeholder = productPlaceholderIcon(product);

  if (product.imageUrl && !broken) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        className="modal-product-img"
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <span className="modal-product-fallback">
      <img src={placeholder} alt="" className="inline-icon inline-icon--xl" />
    </span>
  );
}

function ProductModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="product-modal-overlay" onClick={onClose} role="presentation">
      <div className="product-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button type="button" className="close-modal-btn" onClick={onClose}>×</button>
        <div className="modal-content">
          <div className="modal-image">
            <ModalProductImage product={product} />
          </div>
          <div className="modal-details">
            <h2>{product.name}</h2>
            <div className="modal-brand">{product.brand}</div>
            <div className="modal-price">
              {'\u20b1'}{product.price.toLocaleString()}
              {product.oldPrice && (
                <span className="product-old-price"> {'\u20b1'}{product.oldPrice.toLocaleString()}</span>
              )}
            </div>
            <p className="modal-description">{product.description}</p>
            <ul className="modal-specs">
              <li><span className="spec-label">Model:</span><span>{product.model}</span></li>
              <li><span className="spec-label">Capacity:</span><span>{product.specs || product.capacity}</span></li>
              <li><span className="spec-label">Energy Rating:</span><span>{product.energyRating}</span></li>
              <li><span className="spec-label">Warranty:</span><span>{product.warranty}</span></li>
            </ul>
            <div className="quantity-selector">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button type="button" className="add-to-cart-modal" onClick={handleAddToCart}>
              Add to Cart - {'\u20b1'}{(product.price * quantity).toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
