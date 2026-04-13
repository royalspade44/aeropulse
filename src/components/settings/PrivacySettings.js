import { useState } from 'react';
import icons from '../common/icons';

function PrivacySettings() {
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    activityStatus: true
  });

  const [showDataExport, setShowDataExport] = useState(false);

  const handlePrivacyChange = (key, value) => {
    setPrivacy({ ...privacy, [key]: value });
    alert(`${key} updated to ${value}`);
  };

  const handleDataExport = () => {
    alert('Your data is being prepared for export. You will receive an email shortly.');
    setShowDataExport(false);
  };

  return (
    <div className="settings-section">
      <div className="section-title">
        <span className="section-icon"><img src={icons.shieldKeyhole} alt="" className="inline-icon inline-icon--md" /></span>
        <h2>Privacy & Security</h2>
      </div>
      <div className="settings-list">
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Profile Visibility</div>
            <div className="setting-description">Who can see your profile</div>
          </div>
          <select
            value={privacy.profileVisibility}
            onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
            className="setting-select"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="contacts">Only Contacts</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Show Email</div>
            <div className="setting-description">Display email on profile</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={privacy.showEmail} onChange={() => handlePrivacyChange('showEmail', !privacy.showEmail)} />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Show Phone Number</div>
            <div className="setting-description">Display phone on profile</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={privacy.showPhone} onChange={() => handlePrivacyChange('showPhone', !privacy.showPhone)} />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Activity Status</div>
            <div className="setting-description">Show when you're online</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={privacy.activityStatus} onChange={() => handlePrivacyChange('activityStatus', !privacy.activityStatus)} />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item" onClick={() => setShowDataExport(true)}>
          <div className="setting-info">
            <div className="setting-label">Export My Data</div>
            <div className="setting-description">Download your account data</div>
          </div>
          <span className="chevron">→</span>
        </div>
      </div>

      {/* Data Export Modal */}
      {showDataExport && (
        <div className="settings-modal-overlay" onClick={() => setShowDataExport(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Export Your Data</h3>
              <button className="close-modal" onClick={() => setShowDataExport(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>This will export all your account data including:</p>
              <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#666' }}>
                <li>Profile information</li>
                <li>Order history</li>
                <li>Service bookings</li>
                <li>Saved addresses</li>
                <li>Notification preferences</li>
              </ul>
              <p style={{ marginTop: '15px', color: '#f44336', fontSize: '13px' }}>
                This process may take a few minutes. You'll receive an email with your data.
              </p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowDataExport(false)}>
                Cancel
              </button>
              <button className="modal-btn modal-btn-primary" onClick={handleDataExport}>
                Request Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrivacySettings;