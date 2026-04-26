import { useState } from 'react';

const PHONE_MAX_DIGITS = 11;

const sanitizePhone = (value) => value.replace(/\D/g, '').slice(0, PHONE_MAX_DIGITS);

const validateAddress = (address) => {
  const errors = [];
  if (!address.name?.trim()) errors.push('Recipient name is required.');
  if (!address.street?.trim()) errors.push('Street address is required.');
  if (!address.city?.trim()) errors.push('City is required.');
  if (!address.phone?.trim()) errors.push('Phone number is required.');

  const phoneDigits = sanitizePhone(address.phone || '');
  if (phoneDigits && !/^09\d{9}$/.test(phoneDigits)) {
    errors.push('Phone number must be a valid PH mobile format (09XXXXXXXXX).');
  }

  if (address.postalCode?.trim() && !/^\d{4}$/.test(address.postalCode.trim())) {
    errors.push('Postal code must be 4 digits.');
  }

  return errors;
};

function AddAddressModal({
  onClose,
  onSave,
  initialAddress = null,
  title = 'Add New Address',
  saveLabel = 'Save Address',
  isSaving = false
}) {
  const [address, setAddress] = useState({
    type: initialAddress?.type || 'home',
    label: initialAddress?.label || '',
    name: initialAddress?.name || '',
    street: initialAddress?.street || '',
    city: initialAddress?.city || '',
    postalCode: initialAddress?.postalCode || '',
    phone: initialAddress?.phone || '',
    isDefault: Boolean(initialAddress?.isDefault)
  });

  const handleSubmit = () => {
    const normalized = {
      ...address,
      name: address.name.trim(),
      street: address.street.trim(),
      city: address.city.trim(),
      postalCode: address.postalCode.trim(),
      phone: sanitizePhone(address.phone)
    };
    const errors = validateAddress(normalized);
    if (errors.length > 0) {
      alert(errors[0]);
      return;
    }
    onSave(normalized);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="address-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Label</label>
            <input
              type="text"
              placeholder="Home, Office, Condo"
              value={address.label}
              onChange={(e) => setAddress({ ...address, label: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Address Type</label>
            <select value={address.type} onChange={(e) => setAddress({ ...address, type: e.target.value })}>
              <option value="home">Home</option>
              <option value="office">Office</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Recipient Name *</label>
            <input
              type="text"
              placeholder="Full name"
              value={address.name}
              onChange={(e) => setAddress({ ...address, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Street Address *</label>
            <input
              type="text"
              placeholder="House/Block/Lot No., Street"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                placeholder="Postal code"
                value={address.postalCode}
              maxLength={4}
              inputMode="numeric"
              onChange={(e) => setAddress({ ...address, postalCode: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              placeholder="Contact number"
              value={address.phone}
              inputMode="numeric"
              maxLength={PHONE_MAX_DIGITS}
              onChange={(e) => setAddress({ ...address, phone: sanitizePhone(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
              <input
                type="checkbox"
                checked={address.isDefault}
                onChange={(e) => setAddress({ ...address, isDefault: e.target.checked })}
              />
              Set as default delivery address
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose} disabled={isSaving}>Cancel</button>
          <button className="confirm-btn" onClick={handleSubmit} disabled={isSaving}>{isSaving ? 'Saving...' : saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default AddAddressModal;