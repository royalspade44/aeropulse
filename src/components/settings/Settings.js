import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import './Settings.css';
import ProfileSettings from './ProfileSettings';
import AccountSettings from './AccountSettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';
import PreferencesSettings from './PreferencesSettings';

function Settings() {
  const { user, updateProfile, updatePreferences, updatePrivacy, updateNotifications, changePassword, deleteAccount, logout } = useUser();
  const navigate = useNavigate();
  
  const [darkMode, setDarkMode] = useState(() => {
    if (user?.preferences?.darkMode !== undefined) {
      return user.preferences.darkMode;
    }
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Save dark mode preference to user context if user is logged in
    if (user) {
      updatePreferences({ darkMode }).catch(err => console.error('Failed to save dark mode:', err));
    }
  }, [darkMode, user, updatePreferences]);

  const handleUpdateProfile = async (updatedData) => {
    try {
      await updateProfile(updatedData);
      alert('Profile updated successfully!');
      return true;
    } catch (error) {
      alert('Error updating profile: ' + error.message);
      return false;
    }
  };

  const handleUpdatePreferences = async (preferences) => {
    try {
      await updatePreferences(preferences);
      return true;
    } catch (error) {
      alert('Error updating preferences: ' + error.message);
      return false;
    }
  };

  const handleUpdatePrivacy = async (privacy) => {
    try {
      await updatePrivacy(privacy);
      return true;
    } catch (error) {
      alert('Error updating privacy settings: ' + error.message);
      return false;
    }
  };

  const handleUpdateNotifications = async (notifications) => {
    try {
      await updateNotifications(notifications);
      return true;
    } catch (error) {
      alert('Error updating notification settings: ' + error.message);
      return false;
    }
  };

  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      await changePassword(currentPassword, newPassword);
      alert('Password changed successfully!');
      return true;
    } catch (error) {
      alert('Error changing password: ' + error.message);
      return false;
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm('Are you sure you want to delete your account? This action cannot be undone!');
    if (confirm) {
      try {
        await deleteAccount();
        alert('Account deleted successfully');
        navigate('/login', { replace: true });
      } catch (error) {
        alert('Error deleting account: ' + error.message);
      }
    }
  };

  const handleBack = () => {
    // Check if there's a previous page in history
    if (window.history.length > 2) {
      navigate(-1); // Go back to previous page
    } else {
      navigate('/home'); // Fallback to home
    }
  };

  const handleLogout = () => {
    const confirm = window.confirm('Are you sure you want to logout?');
    if (confirm) {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const handleDarkModeChange = (isDark) => {
    setDarkMode(isDark);
  };

  // Format user data for profile display - handle both naming conventions
  const formattedUser = user ? {
    ...user,
    name: user.name || `${user.name_first || ''} ${user.name_last || ''}`.trim() || user.email?.split('@')[0] || 'User',
    fullName: user.name || `${user.name_first || ''} ${user.name_last || ''}`.trim(),
    address: user.address || '' // Address starts empty as requested
  } : null;

  return (
    <div className={`settings-container ${darkMode ? 'dark' : ''}`}>
      <div className="settings-header">
        <button className="back-btn" onClick={handleBack} aria-label="Go back">
          ←
        </button>
        <h1>Settings</h1>
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </div>

      <div className="settings-content">
        <ProfileSettings 
          user={formattedUser} 
          onUpdateProfile={handleUpdateProfile} 
        />
        <AccountSettings 
          onChangePassword={handleChangePassword}
          onDeleteAccount={handleDeleteAccount}
        />
        <NotificationSettings 
          user={user}
          onUpdateNotifications={handleUpdateNotifications}
        />
        <PrivacySettings 
          user={user}
          onUpdatePrivacy={handleUpdatePrivacy}
        />
        <PreferencesSettings 
          onDarkModeChange={handleDarkModeChange} 
          darkMode={darkMode}
          user={user}
          onUpdatePreferences={handleUpdatePreferences}
        />
      </div>
    </div>
  );
}

export default Settings;