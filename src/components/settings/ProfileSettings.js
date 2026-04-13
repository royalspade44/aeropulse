import { useState, useEffect } from 'react';
import icons from '../common/icons';

function ProfileSettings({ user, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || user.contactNumber || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Name is required!');
      return;
    }
    if (!formData.email.trim()) {
      alert('Email is required!');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Phone number is required!');
      return;
    }
    onUpdateProfile(formData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="settings-section">
      <div className="section-title">
        <span className="section-icon">
          <img src={icons.memberList} alt="" className="inline-icon inline-icon--md" />
        </span>
        <h2>Profile Information</h2>
      </div>
      <div className="settings-list">
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Full Name</div>
            <div className="setting-description">Your display name from registration</div>
          </div>
          {isEditing ? (
            <div className="edit-mode">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="setting-input"
                placeholder="Enter your full name"
              />
            </div>
          ) : (
            <div className="setting-value">{formData.name || 'Not set'}</div>
          )}
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Email Address</div>
            <div className="setting-description">Your login email from registration</div>
          </div>
          {isEditing ? (
            <div className="edit-mode">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="setting-input"
                placeholder="Enter your email"
              />
            </div>
          ) : (
            <div className="setting-value">{formData.email || 'Not set'}</div>
          )}
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Phone Number</div>
            <div className="setting-description">Your contact number from registration</div>
          </div>
          {isEditing ? (
            <div className="edit-mode">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="setting-input"
                placeholder="Enter your phone number"
              />
            </div>
          ) : (
            <div className="setting-value">{formData.phone || 'Not set'}</div>
          )}
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Address</div>
            <div className="setting-description">Your location (optional)</div>
          </div>
          {isEditing ? (
            <div className="edit-mode">
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="setting-input"
                placeholder="Enter your address (optional)"
              />
            </div>
          ) : (
            <div className="setting-value">{formData.address || 'Not provided'}</div>
          )}
        </div>

        {!isEditing ? (
          <div className="setting-item">
            <button type="button" onClick={() => setIsEditing(true)} className="edit-btn save-btn" style={{ color: '#1E88E5' }}>
              <img src={icons.customize} alt="" className="inline-icon" /> Edit Profile
            </button>
          </div>
        ) : (
          <div className="setting-item">
            <div className="edit-buttons">
              <button type="button" onClick={handleSave} className="edit-btn save-btn">
                <img src={icons.checkCircle} alt="" className="inline-icon" /> Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  if (user) {
                    setFormData({
                      name: user.name || user.fullName || '',
                      email: user.email || '',
                      phone: user.phone || user.contactNumber || '',
                      address: user.address || ''
                    });
                  }
                }}
                className="edit-btn cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileSettings;
