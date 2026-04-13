import icons from '../common/icons';

function DeliveryAddress({ addresses, selectedAddress, onSelectAddress, onAddAddress }) {
  const typeLabel = (address) => {
    if (address.type === 'home') {
      return (
        <>
          <img src={icons.houseChimney} alt="" className="inline-icon" /> Home
        </>
      );
    }
    if (address.type === 'office') {
      return (
        <>
          <img src={icons.customize} alt="" className="inline-icon" /> Office
        </>
      );
    }
    return (
      <>
        <img src={icons.marker} alt="" className="inline-icon" /> Other
      </>
    );
  };

  return (
    <div className="checkout-section">
      <div className="section-header">
        <h2>Delivery Address</h2>
        <button type="button" className="add-btn" onClick={onAddAddress}>+ Add New Address</button>
      </div>
      {addresses.map(address => (
        <div
          key={address.id}
          className={`address-card ${selectedAddress?.id === address.id ? 'selected' : ''}`}
          onClick={() => onSelectAddress(address)}
          role="presentation"
        >
          <div className="address-type">
            {typeLabel(address)}
            {selectedAddress?.id === address.id && (
              <span style={{ color: '#1E88E5', marginLeft: 'auto' }}>{'\u2713'} Selected</span>
            )}
          </div>
          <div className="address-details">
            <p><strong>{address.name}</strong></p>
            <p>{address.street}</p>
            <p>{address.city}, {address.postalCode}</p>
            <p><img src={icons.phoneCall} alt="" className="inline-icon" /> {address.phone}</p>
          </div>
        </div>
      ))}
      {addresses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
          No saved addresses. Click &quot;Add New Address&quot; to continue.
        </div>
      )}
    </div>
  );
}

export default DeliveryAddress;
