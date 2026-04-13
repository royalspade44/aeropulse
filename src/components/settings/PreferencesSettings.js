import { useState, useEffect } from 'react';
import icons from '../common/icons';

function PreferencesSettings({ onDarkModeChange, darkMode }) {
  const [preferences, setPreferences] = useState({
    language: 'English',
    currency: 'PHP',
    timezone: 'Asia/Manila',
    autoBook: true
  });

  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      const parsed = JSON.parse(savedPreferences);
      setPreferences(prev => ({ ...prev, ...parsed }));
    }
  }, []);

  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
    
    if (key === 'darkMode') {
      onDarkModeChange(value);
    }
    
    // Show success message without alert for better UX
    showToast(`${key} updated to ${value}`);
  };

  const showToast = (message) => {
    // Create a temporary toast notification
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      z-index: 2000;
      animation: fadeInOut 2s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  return (
    <div className="settings-section">
      <div className="section-title">
        <span className="section-icon"><img src={icons.customize} alt="" className="inline-icon inline-icon--md" /></span>
        <h2>Preferences</h2>
      </div>
      <div className="settings-list">
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Language</div>
            <div className="setting-description">Choose your preferred language</div>
          </div>
          <select
            value={preferences.language}
            onChange={(e) => handlePreferenceChange('language', e.target.value)}
            className="setting-select"
          >
            <option value="English">English</option>
            <option value="Filipino">Filipino</option>
            <option value="Chinese">Chinese</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Currency</div>
            <div className="setting-description">Display currency format (Fixed: Philippine Peso)</div>
          </div>
          <select
            value={preferences.currency}
            className="setting-select"
            disabled
            style={{ opacity: 0.7, cursor: 'not-allowed' }}
          >
            <option value="PHP">Philippine Peso (₱)</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Time Zone</div>
            <div className="setting-description">Set your local time zone</div>
          </div>
          <select
            value={preferences.timezone}
            onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
            className="setting-select"
          >
            <option value="Asia/Manila">Manila (GMT+8)</option>
            <option value="Asia/Cebu">Cebu (GMT+8)</option>
            <option value="Asia/Davao">Davao (GMT+8)</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Dark Mode</div>
            <div className="setting-description">Switch to dark theme for the entire website</div>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={darkMode} 
              onChange={() => handlePreferenceChange('darkMode', !darkMode)} 
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Auto-Booking</div>
            <div className="setting-description">Automatically book recurring services</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={preferences.autoBook} onChange={() => handlePreferenceChange('autoBook', !preferences.autoBook)} />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default PreferencesSettings;