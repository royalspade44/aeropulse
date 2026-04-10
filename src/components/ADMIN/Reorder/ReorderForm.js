import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../config/api';

const ReorderForm = ({ item, onSubmitted }) => {
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setQuantity('');
    setMessage('');
    setError('');
  }, [item]);

  const submit = async (event) => {
    event.preventDefault();
    if (!item) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await apiRequest('/reorders', {
        method: 'POST',
        body: JSON.stringify({ productId: item.id, quantity: Number(quantity) || 0 }),
      });
      setMessage(`Reorder submitted for ${item.name}: ${quantity || 0} units.`);
      onSubmitted?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <h3>Reorder Form</h3>
      {item ? (
        <>
          <p><strong>Item:</strong> {item.name}</p>
          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
          <button type="submit" disabled={saving}>{saving ? 'Submitting…' : 'Submit Reorder'}</button>
        </>
      ) : (
        <p>Select an item from the left panel.</p>
      )}
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      {message && <p>{message}</p>}
    </form>
  );
};

export default ReorderForm;
