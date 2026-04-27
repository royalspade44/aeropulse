import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../../config/api';
import AddAddressModal from '../checkout/AddAddressModal';
import icons from '../common/icons';

const normalizePhone = (value = '') => String(value).replace(/\D/g, '').slice(0, 11);
const isValidPhone = (value = '') => /^09\d{9}$/.test(String(value || '').trim());

function ProfileSettings({ user, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: '',
    phone: '',
    avatarUrl: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const fileInputRef = useRef(null);

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
    if (user) {
      setFormData({
        name: user.name || user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        role: user.role || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleInputChange = (field, value) => {
    if (field === 'phone') {
      setFormData((prev) => ({ ...prev, phone: normalizePhone(value) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Full name is required.');
      return;
    }
    if (!formData.phone.trim() || !isValidPhone(formData.phone)) {
      alert('Phone must be in 09XXXXXXXXX format.');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateProfile({
        name: formData.name.trim(),
        username: formData.username.trim(),
        phone: formData.phone.trim(),
        avatarUrl: formData.avatarUrl,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFilePick = () => {
    if (!isEditing) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Profile picture must be 2MB or less.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, avatarUrl: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

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

  return (
    <div className="settings-section">
      <div className="section-title">
        <span className="section-icon">
          <img src={icons.memberList} alt="" className="inline-icon inline-icon--md" />
        </span>
        <h2>Profile</h2>
      </div>

      <div className="settings-list">
        <div className="setting-item setting-item--column">
          <div className="settings-avatar-row">
            <button type="button" className="settings-avatar-button" onClick={handleFilePick}>
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Profile" className="settings-avatar-image" />
              ) : (
                <span>{(formData.name || 'U').charAt(0).toUpperCase()}</span>
              )}
            </button>
            <div>
              <div className="setting-label">Profile Picture</div>
              <div className="setting-description">Upload JPG, PNG, or WebP. Max 2MB.</div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Full Name</div>
          </div>
          <input
            type="text"
            className="setting-input"
            value={formData.name}
            disabled={!isEditing}
            onChange={(event) => handleInputChange('name', event.target.value)}
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Username (Optional)</div>
          </div>
          <input
            type="text"
            className="setting-input"
            value={formData.username}
            disabled={!isEditing}
            onChange={(event) => handleInputChange('username', event.target.value)}
            placeholder="username"
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Email Address</div>
            <div className="setting-description">Email updates require a separate verification flow.</div>
          </div>
          <input type="email" className="setting-input" value={formData.email} disabled />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Role</div>
          </div>
          <input type="text" className="setting-input" value={(formData.role || '').toUpperCase()} disabled />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Contact Number</div>
          </div>
          <input
            type="tel"
            className="setting-input"
            value={formData.phone}
            disabled={!isEditing}
            onChange={(event) => handleInputChange('phone', event.target.value)}
            placeholder="09XXXXXXXXX"
          />
        </div>

        <div className="setting-item setting-item--column">
          <div className="settings-row-between">
            <div>
              <div className="setting-label">Addresses</div>
              <div className="setting-description">Manage your saved delivery addresses.</div>
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
          {!addressLoading && !addresses.length ? <div className="setting-description">No saved addresses yet.</div> : null}

          <div className="settings-address-list">
            {addresses.map((address) => {
              const id = address.id || address._id;
              const line = [address.street, address.barangay, address.city, address.province, address.region].filter(Boolean).join(', ');
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

        {!isEditing ? (
          <div className="setting-item">
            <button type="button" onClick={() => setIsEditing(true)} className="edit-btn save-btn">
              <img src={icons.customize} alt="" className="inline-icon" /> Edit Profile
            </button>
          </div>
        ) : (
          <div className="setting-item">
            <div className="edit-buttons">
              <button type="button" onClick={handleSave} className="edit-btn save-btn" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user?.name || user?.fullName || '',
                    username: user?.username || '',
                    email: user?.email || '',
                    role: user?.role || '',
                    phone: user?.phone || '',
                    avatarUrl: user?.avatarUrl || '',
                  });
                }}
                className="edit-btn cancel-btn"
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {addressModalOpen ? (
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
      ) : null}
    </div>
  );
}

export default ProfileSettings;
