import { useEffect, useState } from 'react';
import icons from '../common/icons';

function PrivacySettings({ user, onUpdatePrivacy, onUpdateSettings }) {
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    dataSharing: false,
    showEmail: false,
    showPhone: false,
    activityStatus: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const source = user?.privacy || {};
    setPrivacy({
      profileVisibility: source.profileVisibility || 'public',
      dataSharing: source.dataSharing || false,
      showEmail: source.showEmail || false,
      showPhone: source.showPhone || false,
      activityStatus: source.activityStatus !== false,
    });
  }, [user]);

  const updateField = (key, value) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (onUpdateSettings) {
        await onUpdateSettings({ privacy });
      } else {
        await onUpdatePrivacy(privacy);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-section">
      <div className="section-title">
        <span className="section-icon"><img src={icons.shieldKeyhole} alt="" className="inline-icon inline-icon--md" /></span>
        <h2>Privacy</h2>
      </div>
      <div className="settings-list">
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Profile Visibility</div>
            <div className="setting-description">Control who can view your profile.</div>
          </div>
          <select
            value={privacy.profileVisibility}
            onChange={(event) => updateField('profileVisibility', event.target.value)}
            className="setting-select"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="role_based">Role-based</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Data Sharing</div>
            <div className="setting-description">Allow usage analytics and service personalization.</div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={privacy.dataSharing}
              onChange={() => updateField('dataSharing', !privacy.dataSharing)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Show Email</div>
            <div className="setting-description">Display your email based on visibility rules.</div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={privacy.showEmail}
              onChange={() => updateField('showEmail', !privacy.showEmail)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Show Contact Number</div>
            <div className="setting-description">Display your contact number based on visibility rules.</div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={privacy.showPhone}
              onChange={() => updateField('showPhone', !privacy.showPhone)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Activity Visibility</div>
            <div className="setting-description">Show activity/online status.</div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={privacy.activityStatus}
              onChange={() => updateField('activityStatus', !privacy.activityStatus)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="setting-item">
          <button type="button" className="modal-btn modal-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Privacy Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivacySettings;
