import React, { useState } from 'react';
import { apiRequest } from '../../../config/api';

const initialForm = { name: '', sku: '', stock: '', threshold: '', price: '' };

const AddProduct = ({ onCreated }) => {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.sku) return;
    setError('');
    setSaving(true);
    try {
      const result = await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          stock: Number(form.stock) || 0,
          threshold: Number(form.threshold) || 0,
          price: Number(form.price) || 0,
        }),
      });
      onCreated?.(result.product);
      setForm(initialForm);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h3>Add Product</h3>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Product name" />
      <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" />
      <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" type="number" />
      <input name="threshold" value={form.threshold} onChange={handleChange} placeholder="Low-stock threshold (optional)" type="number" />
      <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" />
      <button type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add'}</button>
      {error && <p style={{ color: '#b91c1c', marginBottom: 0 }}>{error}</p>}
    </form>
  );
};

export default AddProduct;
