import { Link } from 'react-router-dom';
import icons from '../common/icons';
import { useState } from 'react';

function AccountSettings({ user, onRequestPasswordChangeEmail, onDeleteAccount }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteData, setDeleteData] = useState({
    password: '',
    confirmText: '',
  });
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingEmailRequest, setLoadingEmailRequest] = useState(false);

  const usesLocalPassword = Boolean(user?.authProvider !== 'google' || user?.passwordHash);

  const handleDeleteAccount = async () => {
    if (deleteData.confirmText.trim().toUpperCase() !== 'DELETE') {
      alert('Please type DELETE to continue.');
      return;
    }
    if (usesLocalPassword && !deleteData.password) {
      alert('Password confirmation is required.');
      return;
    }

    setLoadingDelete(true);
    try {
      await onDeleteAccount({
        password: deleteData.password,
        confirmText: deleteData.confirmText,
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleRequestViaEmail = async () => {
    setLoadingEmailRequest(true);
    try {
      await onRequestPasswordChangeEmail?.();
    } finally {
      setLoadingEmailRequest(false);
    }
  };

  return (
    <div className="settings-section">
      <div className="section-title">
        <span className="section-icon"><img src={icons.lock} alt="" className="inline-icon inline-icon--md" /></span>
        <h2>Security</h2>
      </div>
      <div className="settings-list">
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Change Password</div>
            <div className="setting-description">Send a secure password change link to your registered email.</div>
          </div>
          <button
            type="button"
            className="modal-btn modal-btn-secondary"
            onClick={handleRequestViaEmail}
            disabled={loadingEmailRequest}
          >
            {loadingEmailRequest ? 'Sending...' : 'Send Link'}
          </button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Forgot Password</div>
            <div className="setting-description">Use recovery screen if you are logged out.</div>
          </div>
          <Link className="modal-btn modal-btn-secondary" to="/forgot-password">Open</Link>
        </div>

        <div className="setting-item danger" onClick={() => setShowDeleteModal(true)}>
          <div className="setting-info">
            <div className="setting-label">Delete Account</div>
            <div className="setting-description">This action is irreversible. Your profile will be removed or anonymized.</div>
          </div>
          <span className="chevron" style={{ color: '#f44336' }}>→</span>
        </div>
      </div>

      {showDeleteModal ? (
        <div className="settings-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="settings-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Account</h3>
              <button className="close-modal" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginTop: 0, color: '#b91c1c', fontWeight: 600 }}>
                This action is irreversible.
              </p>
              {usesLocalPassword ? (
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={deleteData.password}
                    onChange={(event) => setDeleteData((prev) => ({ ...prev, password: event.target.value }))}
                  />
                </div>
              ) : null}
              <div className="form-group">
                <label>Type DELETE to confirm</label>
                <input
                  type="text"
                  value={deleteData.confirmText}
                  onChange={(event) => setDeleteData((prev) => ({ ...prev, confirmText: event.target.value }))}
                  placeholder="DELETE"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="modal-btn modal-btn-danger" onClick={handleDeleteAccount} disabled={loadingDelete}>
                {loadingDelete ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AccountSettings;
