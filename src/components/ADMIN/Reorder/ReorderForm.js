import React, { useEffect, useState } from 'react';

const ReorderForm = ({ item }) => {
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setQuantity('');
    setMessage('');
  }, [item]);

  const submit = (event) => {
    event.preventDefault();
    if (!item) return;
    setMessage(`Reorder submitted for ${item.name}: ${quantity || 0} units.`);
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
          <button type="submit">Submit Reorder</button>
        </>
      ) : (
        <p>Select an item from the left panel.</p>
      )}
      {message && <p>{message}</p>}
    </form>
  );
};

export default ReorderForm;
