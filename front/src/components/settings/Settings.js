import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import './Settings.css';
import AccountSettings from './AccountSettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';
import PreferencesSettings from './PreferencesSettings';
import icons from '../common/icons';
import CustomerHeaderBrand from '../common/CustomerHeaderBrand';
import Footer from '../home/Footer';
import { translateText } from '../../utils/customerI18n';

const SETTINGS_TABS = [
  { id: 'preferences', title: 'Preferences', icon: icons.customize },
  { id: 'privacy', title: 'Privacy', icon: icons.shieldKeyhole },
  { id: 'notifications', title: 'Notifications', icon: icons.visit },
  { id: 'security', title: 'Security', icon: icons.lock },
];

function Settings() {
  const {
    user,
    currentTheme,
    updatePreferences,
    updatePrivacy,
    updateNotifications,
    updateSettings,
    requestPasswordChangeEmail,
    deleteAccount,
    logout,
  } = useUser();
  const navigate = useNavigate();

  const isDark = currentTheme === 'dark';

  const [activeTab, setActiveTab] = useState('preferences');
  const [toast, setToast] = useState(null);

  const formattedUser = useMemo(() => {
    if (!user) return null;
    return {
      ...user,
      name: user.name || `${user.name_first || ''} ${user.name_last || ''}`.trim() || user.email?.split('@')[0] || 'User',
      fullName: user.name || `${user.name_first || ''} ${user.name_last || ''}`.trim(),
      username: user.username || '',
      role: user.role || 'customer',
      preferences: user.preferences || {},
      privacy: user.privacy || {},
      notifications: user.notifications || {},
    };
  }, [user]);

  const language = formattedUser?.preferences?.language || 'English';
  const t = (text) => translateText(text, language);

  const pushToast = (message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2400);
  };

  const callWithToast = async (action, successMessage) => {
    try {
      const result = await action();
      pushToast(successMessage, 'success');
      return result;
    } catch (error) {
      pushToast(error.message || 'Unable to save changes.', 'error');
      throw error;
    }
  };

  const handleUpdatePreferences = (payload) => callWithToast(
    () => updatePreferences(payload),
    'Preferences saved.'
  );

  const handleUpdatePrivacy = (payload) => callWithToast(
    () => updatePrivacy(payload),
    'Privacy settings saved.'
  );

  const handleUpdateNotifications = (payload) => callWithToast(
    () => updateNotifications(payload),
    'Notification settings saved.'
  );

  const handleBulkUpdateSettings = (payload) => callWithToast(
    () => updateSettings(payload),
    'Settings saved.'
  );

  const handleDeleteAccount = (payload) => callWithToast(
    async () => {
      await deleteAccount(payload);
      navigate('/login', { replace: true });
    },
    'Account deleted successfully.'
  );

  const handleRequestPasswordChangeEmail = () => callWithToast(
    () => requestPasswordChangeEmail(),
    'Password change link sent to your email.'
  );

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={`settings-container ${isDark ? 'dark' : ''}`}>
      <div className="settings-header">
        <div className="customer-header-left-group">
          <button className="back-btn" onClick={handleBack} aria-label="Go back" type="button">
            ←
          </button>
          <CustomerHeaderBrand />
        </div>
        <div className="customer-header-spacer" />
        <div className="customer-header-right-group">
          <h1>{t('Account Settings')}</h1>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <img src={icons.signOutAlt} alt="" className="inline-icon inline-icon--md" /> {t('Logout')}
          </button>
        </div>
      </div>

      <div className="settings-content settings-content--layout">
        <aside className="settings-nav-card">
          <div className="settings-user-badge">
            <div className="settings-user-avatar">
              {formattedUser?.avatarUrl ? (
                <img src={formattedUser.avatarUrl} alt="Profile" />
              ) : (
                <span>{(formattedUser?.name || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h3>{formattedUser?.name || 'User'}</h3>
              <p>{formattedUser?.email || ''}</p>
              <small>{(formattedUser?.role || '').toUpperCase()}</small>
            </div>
          </div>

          <nav className="settings-nav-list" aria-label="Settings sections">
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <img src={tab.icon} alt="" className="inline-icon" />
                <span>{t(tab.title)}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="settings-panel-stack">
          {activeTab === 'preferences' ? (
            <PreferencesSettings
              user={formattedUser}
              onUpdatePreferences={handleUpdatePreferences}
              onUpdateSettings={handleBulkUpdateSettings}
            />
          ) : null}

          {activeTab === 'privacy' ? (
            <PrivacySettings
              user={formattedUser}
              onUpdatePrivacy={handleUpdatePrivacy}
              onUpdateSettings={handleBulkUpdateSettings}
            />
          ) : null}

          {activeTab === 'notifications' ? (
            <NotificationSettings
              user={formattedUser}
              onUpdateNotifications={handleUpdateNotifications}
              onUpdateSettings={handleBulkUpdateSettings}
            />
          ) : null}

          {activeTab === 'security' ? (
            <AccountSettings
              user={formattedUser}
              onRequestPasswordChangeEmail={handleRequestPasswordChangeEmail}
              onDeleteAccount={handleDeleteAccount}
            />
          ) : null}
        </section>
      </div>

      {toast ? (
        <div className={`settings-toast ${toast.type === 'error' ? 'settings-toast--error' : ''}`}>
          {toast.message}
        </div>
      ) : null}

      <Footer />
    </div>
  );
}

export default Settings;
