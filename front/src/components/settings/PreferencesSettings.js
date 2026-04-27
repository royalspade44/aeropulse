import { useEffect, useState } from 'react';
import icons from '../common/icons';
import { translateText } from '../../utils/customerI18n';

function PreferencesSettings({ user, onUpdatePreferences, onUpdateSettings }) {
  const [preferences, setPreferences] = useState({
    language: 'English',
    timezone: 'Asia/Manila',
    theme: 'light',
    autoBook: true,
  });
  const [saving, setSaving] = useState(false);
  const language = user?.preferences?.language || 'English';
  const t = (text) => translateText(text, language);

  useEffect(() => {
    const source = user?.preferences || {};
    setPreferences({
      language: source.language || 'English',
      timezone: source.timezone || 'Asia/Manila',
      theme: source.theme || (source.darkMode ? 'dark' : 'light'),
      autoBook: source.autoBook !== false,
    });
  }, [user]);

  const updateField = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        language: preferences.language,
        timezone: preferences.timezone,
        theme: preferences.theme,
        darkMode: preferences.theme === 'dark',
        autoBook: preferences.autoBook,
      };
      if (onUpdateSettings) {
        await onUpdateSettings({ preferences: payload });
      } else {
        await onUpdatePreferences(payload);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-section">
      <div className="section-title">
        <span className="section-icon"><img src={icons.customize} alt="" className="inline-icon inline-icon--md" /></span>
        <h2>{t('Preferences')}</h2>
      </div>
      <div className="settings-list">
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t('Theme')}</div>
            <div className="setting-description">Choose your app appearance.</div>
          </div>
          <select
            value={preferences.theme}
            onChange={(event) => updateField('theme', event.target.value)}
            className="setting-select"
          >
            <option value="light">{t('Light')}</option>
            <option value="dark">{t('Dark')}</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t('Language')}</div>
            <div className="setting-description">Choose your preferred language.</div>
          </div>
          <select
            value={preferences.language}
            onChange={(event) => updateField('language', event.target.value)}
            className="setting-select"
          >
            <option value="English">English</option>
            <option value="Filipino">Filipino</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t('Timezone')}</div>
            <div className="setting-description">Use your locale for schedules and logs.</div>
          </div>
          <select
            value={preferences.timezone}
            onChange={(event) => updateField('timezone', event.target.value)}
            className="setting-select"
          >
            <option value="Asia/Manila">Asia/Manila</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t('Auto-booking')}</div>
            <div className="setting-description">Automatically schedule recurring services.</div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={preferences.autoBook}
              onChange={() => updateField('autoBook', !preferences.autoBook)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="setting-item">
          <button type="button" className="modal-btn modal-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : t('Save Preferences')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreferencesSettings;
