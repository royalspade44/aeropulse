import React, { useState } from 'react';

const initialForm = { name: '', sku: '', stock: '', price: '' };

const AddProduct = ({ onAdd }) => {
  const [form, setForm] = useState(initialForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.sku) return;
    onAdd({
      id: Date.now(),
      name: form.name,
      sku: form.sku,
      stock: Number(form.stock) || 0,
      price: Number(form.price) || 0
    });
    setForm(initialForm);
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h3>Add Product</h3>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Product name" />
      <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" />
      <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" type="number" />
      <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" />
      <button type="submit">Add</button>
    </form>
  );
};

export default AddProduct;
