function ProductGrid({ products, onAddToCart, onBuyNow, onProductClick }) {
  if (products.length === 0) {
    return (
      <div className="no-products">
        <span>🔍</span>
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
        >
          <div className="product-image">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="product-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span class="product-img-fallback">${product.icon || '❄️'}</span>`;
                }}
              />
            ) : (
              <span className="product-img-fallback">{product.icon || '❄️'}</span>
            )}
            {product.discount && (
              <div className="product-badge">{product.discount}% OFF</div>
            )}
            {product.featured && (
              <div className="product-featured-badge">⭐ Featured</div>
            )}
          </div>
          <div className="product-info">
            <div className="product-brand">{product.brand}</div>
            <div className="product-name">{product.name}</div>
            <div className="product-specs">{product.specs}</div>
            <div className="product-price">
              ₱{product.price.toLocaleString()}
              {product.oldPrice && (
                <span className="product-old-price"> ₱{product.oldPrice.toLocaleString()}</span>
              )}
            </div>
            <div className="product-warranty">🔒 {product.warranty}</div>
            <button 
              className="add-to-cart-btn"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              disabled={!product.inStock}
            >
              {product.inStock ? 'Add to Cart 🛒' : 'Out of Stock'}
            </button>
            {product.inStock && (
              <button
                className="add-to-cart-btn buy-now-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyNow(product);
                }}
              >
                Buy Now ⚡
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductGrid;