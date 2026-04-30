import { useEffect, useMemo, useState } from 'react';
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

  const availableStock = useMemo(() => {
    if (!product) return null;
    if (typeof product.stock !== 'number') return null;
    return Number.isFinite(product.stock) ? Math.max(0, Math.floor(product.stock)) : null;
  }, [product?.stock]);

  const isOutOfStock = availableStock === 0;
  const maxQuantity = availableStock && availableStock > 0 ? availableStock : null;

  useEffect(() => {
    setQuantity(1);
  }, [product?.id, product?.model, product?.sku]);

  useEffect(() => {
    if (!maxQuantity) return;
    setQuantity((prev) => Math.min(prev, maxQuantity));
  }, [maxQuantity]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(product, quantity);
    onClose();
  };

  if (!product) return null;

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
            {typeof availableStock === 'number' ? (
              <div className="product-warranty" style={{ marginBottom: '10px' }}>
                {availableStock > 0 ? `${availableStock} units available` : 'Out of Stock'}
              </div>
            ) : null}
            <div className="quantity-selector">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => (maxQuantity ? Math.min(maxQuantity, prev + 1) : prev + 1))}
                disabled={Boolean(maxQuantity) && quantity >= maxQuantity}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button type="button" className="add-to-cart-modal" onClick={handleAddToCart} disabled={isOutOfStock}>
              {isOutOfStock
                ? 'Out of Stock'
                : `Add to Cart - \u20b1${(product.price * quantity).toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
