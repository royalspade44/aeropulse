import React from 'react';

const InventoryList = ({ products }) => {
  return (
    <div className="admin-card">
      <h3>Inventory List</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Stock</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>{product.stock}</td>
              <td>PHP {product.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryList;
