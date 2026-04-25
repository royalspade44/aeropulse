function NotificationsModal({ isOpen, onClose, notifications, onNotificationClick, onMarkAllAsRead }) {
  if (!isOpen) return null;

  const hasNotifications = notifications.length > 0;

  return (
    <div className="notifications-modal">
      <div className="notifications-header">
        <h4>Notifications</h4>
        <div className="notifications-actions">
          {hasNotifications && (
            <button type="button" className="notif-mark-all-btn" onClick={onMarkAllAsRead}>
              Mark all as read
            </button>
          )}
          <button type="button" className="close-notif" onClick={onClose}>×</button>
        </div>
      </div>
      <div className="notifications-list">
        {!hasNotifications ? (
          <div className="empty-cart">No notifications</div>
        ) : (
          notifications.map(notif => (
            <button
              key={notif.id}
              type="button"
              className={`notification-item ${notif.unread ? 'unread' : ''}`}
              onClick={() => onNotificationClick?.(notif.id)}
            >
              <div className="notification-title">{notif.title}</div>
              <div className="notification-message">{notif.message}</div>
              <div className="notification-time">{notif.time}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationsModal;