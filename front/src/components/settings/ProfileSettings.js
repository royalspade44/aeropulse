import { useEffect, useState } from 'react';
import { apiRequest } from '../../config/api';
import AddAddressModal from '../checkout/AddAddressModal';
import icons from '../common/icons';

function MyAddressesSettings({ user }) {
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const loadAddresses = async () => {
    setAddressLoading(true);
    try {
      const result = await apiRequest('/users/addresses');
      setAddresses(result.addresses || []);
    } catch (_error) {
      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleSaveAddress = async (payload) => {
    setAddressSaving(true);
    try {
      if (editingAddress?.id || editingAddress?._id) {
        const id = editingAddress.id || editingAddress._id;
        await apiRequest(`/users/addresses/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest('/users/addresses', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      await loadAddresses();
      setAddressModalOpen(false);
      setEditingAddress(null);
    } catch (error) {
      alert(error.message || 'Unable to save address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    setAddressSaving(true);
    try {
      await apiRequest(`/users/addresses/${addressId}`, { method: 'DELETE' });
      await loadAddresses();
    } catch (error) {
      alert(error.message || 'Unable to delete address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    setAddressSaving(true);
    try {
      await apiRequest(`/users/addresses/${addressId}/default`, { method: 'PATCH' });
      await loadAddresses();
    } catch (error) {
      alert(error.message || 'Unable to update default address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const sortedAddresses = [...addresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

  return (
    <div className="settings-section">
      <div className="section-title">
        <span className="section-icon">
          <img src={icons.marker} alt="" className="inline-icon inline-icon--md" />
        </span>
        <div>
          <h2>My Addresses</h2>
          <p className="setting-description">Add, edit, and manage multiple delivery addresses for checkout.</p>
        </div>
      </div>

      <div className="settings-list">
        <div className="setting-item setting-item--column">
          <div className="settings-row-between">
            <div>
              <div className="setting-label">Saved Addresses</div>
              <div className="setting-description">Manage delivery locations tied to your account.</div>
            </div>
            <button
              type="button"
              className="modal-btn modal-btn-primary"
              onClick={() => {
                setEditingAddress(null);
                setAddressModalOpen(true);
              }}
            >
              Add Address
            </button>
          </div>

          {addressLoading ? <div className="setting-description">Loading addresses...</div> : null}
          {!addressLoading && !sortedAddresses.length ? <div className="setting-description">No saved addresses yet.</div> : null}

          <div className="settings-address-list">
            {sortedAddresses.map((address) => {
              const id = address.id || address._id;
              const line = [address.street, address.barangay, address.city, address.province, address.region]
                .filter(Boolean)
                .join(', ');
              return (
                <div className="settings-address-item" key={id}>
                  <div>
                    <strong>{address.label || address.type || 'Address'}</strong>
                    {address.isDefault ? <span className="settings-pill">Default</span> : null}
                    <p>{address.name} · {address.phone}</p>
                    <small>{line || 'No address line provided'}</small>
                  </div>
                  <div className="settings-address-actions">
                    <button
                      type="button"
                      className="modal-btn modal-btn-secondary"
                      onClick={() => {
                        setEditingAddress(address);
                        setAddressModalOpen(true);
                      }}
                      disabled={addressSaving}
                    >
                      Edit
                    </button>
                    {!address.isDefault ? (
                      <button
                        type="button"
                        className="modal-btn modal-btn-secondary"
                        onClick={() => handleSetDefaultAddress(id)}
                        disabled={addressSaving}
                      >
                        Set Default
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="modal-btn modal-btn-danger"
                      onClick={() => handleDeleteAddress(id)}
                      disabled={addressSaving}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {addressModalOpen && (
        <AddAddressModal
          onClose={() => {
            setAddressModalOpen(false);
            setEditingAddress(null);
          }}
          onSave={handleSaveAddress}
          initialAddress={editingAddress}
          title={editingAddress ? 'Update Address' : 'Add New Address'}
          saveLabel={editingAddress ? 'Save Address' : 'Add Address'}
          isSaving={addressSaving}
        />
      )}
    </div>
  );
}

export default MyAddressesSettings;
