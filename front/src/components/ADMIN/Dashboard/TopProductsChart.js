import React from 'react';

/**
 * TopProductsChart - Display top selling products
 */
const TopProductsChart = ({ products = [] }) => {
  if (!products || products.length === 0) {
    return (
      <div className="top-products-chart">
        <p>No product data available</p>
      </div>
    );
  }

  const maxSale = Math.max(...products.map((p) => p.sales || 0), 1);
  const scale = 100 / maxSale;

  return (
    <div className="top-products-chart">
      <div className="products-list">
        {products.slice(0, 5).map((product, index) => {
          const width = Math.max(10, product.sales * scale);
          return (
            <div key={index} className="product-row">
              <div className="product-rank">{index + 1}</div>
              <div className="product-info">
                <div className="product-name">{product.product}</div>
                <div className="product-bar-container">
                  <div className="product-bar" style={{ width: `${width}%` }}>
                    <span className="product-sales">₱{Number(product.sales || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopProductsChart;
