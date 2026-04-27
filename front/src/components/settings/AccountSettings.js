import { useState } from 'react';
import icons from '../common/icons';

function AccountSettings({ onChangePassword, onDeleteAccount }) {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.new.length < 8) {
      alert('Password must be at least 8 characters!');
      return;
    }
    const ok = await onChangePassword?.(passwordData.current, passwordData.new);
    if (!ok) return;
    alert('Password changed successfully!');
    setShowChangePassword(false);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="settings-section">
      <div className="section-title">
        <span className="section-icon"><img src={icons.lock} alt="" className="inline-icon inline-icon--md" /></span>
        <h2>Account Settings</h2>
      </div>
      <div className="settings-list">
        <div className="setting-item" onClick={() => setShowChangePassword(true)}>
          <div className="setting-info">
            <div className="setting-label">Change Password</div>
            <div className="setting-description">Update your password</div>
          </div>
          <span className="chevron">→</span>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Two-Factor Authentication</div>
            <div className="setting-description">Add an extra layer of security</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Session Management</div>
            <div className="setting-description">View active sessions</div>
          </div>
          <span className="chevron">→</span>
        </div>

        <div className="setting-item" onClick={onDeleteAccount}>
          <div className="setting-info">
            <div className="setting-label">Delete Account</div>
            <div className="setting-description">Permanently delete your account</div>
          </div>
          <span className="chevron" style={{ color: '#f44336' }}>→</span>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="settings-modal-overlay" onClick={() => setShowChangePassword(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Password</h3>
              <button className="close-modal" onClick={() => setShowChangePassword(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="setting-item" style={{ padding: '10px 0' }}>
                <div className="setting-info">
                  <div className="setting-label">Current Password</div>
                </div>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  className="setting-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="setting-item" style={{ padding: '10px 0' }}>
                <div className="setting-info">
                  <div className="setting-label">New Password</div>
                </div>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  className="setting-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="setting-item" style={{ padding: '10px 0' }}>
                <div className="setting-info">
                  <div className="setting-label">Confirm New Password</div>
                </div>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  className="setting-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowChangePassword(false)}>
                Cancel
              </button>
              <button className="modal-btn modal-btn-primary" onClick={handleChangePassword}>
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountSettings;