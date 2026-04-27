import icons from '../common/icons';

function DeliveryAddress({
  addresses,
  selectedAddress,
  onSelectAddress,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  isBusy
}) {
  const formatAddressOption = (address) => {
    const tag = address.label?.trim()
      || (address.type === 'home' ? 'Home' : address.type === 'office' ? 'Office' : 'Address');
    const city = address.city?.trim() || 'No city';
    return `${tag} - ${city}`;
  };

  const selectedValue = selectedAddress?.id || '';

  const handleSelection = (event) => {
    const next = addresses.find((item) => item.id === event.target.value);
    if (next) onSelectAddress(next);
  };

  return (
    <div className="checkout-section">
      <div className="section-header">
        <h2>Delivery Address</h2>
        <button type="button" className="add-btn" onClick={onAddAddress}>+ Add New Address</button>
      </div>
      {addresses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
          No saved addresses. Click &quot;Add New Address&quot; to continue.
        </div>
      )}

      {addresses.length > 0 && (
        <>
          <div className="address-select-wrap">
            <label htmlFor="saved-address-select">Saved Address</label>
            <select
              id="saved-address-select"
              value={selectedValue}
              onChange={handleSelection}
              className="address-select"
              disabled={isBusy}
            >
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {formatAddressOption(address)}
                </option>
              ))}
            </select>
          </div>

          {selectedAddress && (
            <div className="address-card selected">
              <div className="address-type">
                <span>
                  <img src={icons.marker} alt="" className="inline-icon" /> {formatAddressOption(selectedAddress)}
                </span>
                {selectedAddress.isDefault && (
                  <span className="default-tag">Default</span>
                )}
              </div>
              <div className="address-details">
                <p><strong>{selectedAddress.name}</strong></p>
                <p>{selectedAddress.street}</p>
                <p>{selectedAddress.city}, {selectedAddress.postalCode || 'N/A'}</p>
                <p><img src={icons.phoneCall} alt="" className="inline-icon" /> {selectedAddress.phone}</p>
              </div>

              <div className="address-actions-row">
                {!selectedAddress.isDefault && (
                  <button type="button" className="add-btn" onClick={() => onSetDefaultAddress(selectedAddress)} disabled={isBusy}>
                    Set Default
                  </button>
                )}
                <button type="button" className="add-btn" onClick={() => onEditAddress(selectedAddress)} disabled={isBusy}>
                  Edit
                </button>
                <button type="button" className="add-btn danger" onClick={() => onDeleteAddress(selectedAddress)} disabled={isBusy}>
                  Delete
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DeliveryAddress;
