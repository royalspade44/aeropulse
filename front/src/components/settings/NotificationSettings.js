import { useState } from 'react';
import icons from '../common/icons';

function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    promotions: true,
    serviceUpdates: true
  });

  const toggleSetting = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
    alert(`${key} notification ${!notifications[key] ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="settings-section">
      <div className="section-title">
        <span className="section-icon"><img src={icons.visit} alt="" className="inline-icon inline-icon--md" /></span>
        <h2>Notification Settings</h2>
      </div>
      <div className="settings-list">
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Email Notifications</div>
            <div className="setting-description">Receive updates via email</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={notifications.email} onChange={() => toggleSetting('email')} />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Push Notifications</div>
            <div className="setting-description">Receive real-time alerts</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={notifications.push} onChange={() => toggleSetting('push')} />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">SMS Notifications</div>
            <div className="setting-description">Get text message alerts</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={notifications.sms} onChange={() => toggleSetting('sms')} />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Promotions & Offers</div>
            <div className="setting-description">Special deals and discounts</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={notifications.promotions} onChange={() => toggleSetting('promotions')} />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Service Updates</div>
            <div className="setting-description">Maintenance and service alerts</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={notifications.serviceUpdates} onChange={() => toggleSetting('serviceUpdates')} />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default NotificationSettings;