import { useState } from 'react';
import icons from '../common/icons';

function productPlaceholderIcon(product) {
  if (product?.category === 'window') return icons.windowFrame;
  if (product?.category === 'floor') return icons.houseChimney;
  return icons.temperatureFrigid;
}

function ProductImage({ product }) {
  const [broken, setBroken] = useState(false);
  const placeholder = productPlaceholderIcon(product);

  if (product.imageUrl && !broken) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        className="product-img"
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <span className="product-img-fallback">
      <img src={placeholder} alt="" className="inline-icon inline-icon--xl" />
    </span>
  );
}

function ProductGrid({ products, onAddToCart, onBuyNow, onProductClick }) {
  if (products.length === 0) {
    return (
      <div className="no-products">
        <img src={icons.globePointer} alt="" className="inline-icon inline-icon--xl" />
        <p>No products found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map(product => (
        <div
          key={product.id}
          className={`product-card ${product.featured ? 'featured' : ''}`}
          onClick={() => onProductClick(product)}
          role="presentation"
        >
          <div className="product-image">
            <ProductImage product={product} />
            {product.discount && (
              <div className="product-badge">{product.discount}% OFF</div>
            )}
            {product.featured && (
              <div className="product-featured-badge">
                <img src={icons.checkCircle} alt="" className="inline-icon" /> Featured
              </div>
            )}
          </div>
          <div className="product-info">
            <div className="product-brand">{product.brand}</div>
            <div className="product-name">{product.name}</div>
            <div className="product-specs">{product.specs}</div>
            <div className="product-price">
              {'\u20b1'}{product.price.toLocaleString()}
              {product.oldPrice && (
                <span className="product-old-price"> {'\u20b1'}{product.oldPrice.toLocaleString()}</span>
              )}
            </div>
            {typeof product.stock === 'number' && product.stock > 0 && (
              <div className="product-warranty">{product.stock} units available</div>
            )}
            <div className="product-warranty">
              <img src={icons.lock} alt="" className="inline-icon" /> {product.warranty}
            </div>
            <button
              type="button"
              className="add-to-cart-btn"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              disabled={!product.inStock}
            >
              {product.inStock ? (
                <>
                  Add to Cart <img src={icons.cartShoppingFast} alt="" className="inline-icon" />
                </>
              ) : (
                'Out of Stock'
              )}
            </button>
            {product.inStock && (
              <button
                type="button"
                className="add-to-cart-btn buy-now-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyNow(product);
                }}
              >
                Buy Now <img src={icons.bolt} alt="" className="inline-icon" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductGrid;
