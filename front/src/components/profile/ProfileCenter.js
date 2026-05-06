import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import icons from '../common/icons';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';
import { apiRequest } from '../../config/api';
import CartSidebar from '../shop/CartSidebar';
import AddAddressModal from '../checkout/AddAddressModal';
import './ProfileCenter.css';

const normalizeAddress = (address = {}) => ({
  id: String(address.id || address._id || ''),
  label: String(address.label || ''),
  type: String(address.type || 'other'),
  name: String(address.name || ''),
  region: String(address.region || ''),
  province: String(address.province || ''),
  barangay: String(address.barangay || ''),
  street: String(address.street || ''),
  city: String(address.city || ''),
  postalCode: String(address.postalCode || ''),
  phone: String(address.phone || ''),
  isDefault: Boolean(address.isDefault),
});

const normalizeOrder = (order = {}) => ({
  id: String(order.id || order.orderCode || ''),
  orderCode: String(order.orderCode || order.id || ''),
  createdAt: String(order.createdAt || order.date || ''),
  total: Number(order.totalAmount || order.total || 0),
  workflowStatus: String(order.workflowStatus || order.status || 'to_pay'),
  paymentMethod: String(order.paymentMethod || ''),
  receipt: order.receipt || null,
  items: Array.isArray(order.items) ? order.items : [],
  address: order.address || {},
});

const normalizeNotification = (item = {}) => ({
  id: String(item.id || item._id || ''),
  title: String(item.title || 'Notification'),
  message: String(item.message || ''),
  unread: item.status ? item.status === 'unread' : Boolean(item.unread),
  createdAt: String(item.createdAt || ''),
});

const orderCategoryConfig = {
  to_pay: {
    label: 'To Pay',
    icon: icons.cartShoppingFast,
    description: 'Unpaid orders',
    emptyText: 'No unpaid orders right now.',
  },
  to_deliver: {
    label: 'To Deliver',
    icon: icons.boxOpen,
    description: 'Pending delivery items',
    emptyText: 'Nothing is waiting for delivery.',
  },
  to_install: {
    label: 'To Install',
    icon: icons.tools,
    description: 'Awaiting installation',
    emptyText: 'No items are queued for installation.',
  },
  complete: {
    label: 'Completed',
    icon: icons.checkCircle,
    description: 'Finished or archived orders',
    emptyText: 'No completed orders yet.',
  },
};

const formatAddressLabel = (address = {}) => {
  const tag = address.label?.trim()
    || (address.type === 'home' ? 'Home' : address.type === 'office' ? 'Office' : 'Address');
  return `${tag} - ${address.city || 'No city'}`;
};

const formatFullAddress = (address = {}) => ([
  address.street,
  address.barangay,
  address.city,
  address.province,
  address.region,
]
  .filter(Boolean)
  .join(', '));

const formatDate = (value) => {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getOrderCategory = (order) => {
  const status = order.workflowStatus;
  if (status === 'to_deliver') return 'to_deliver';
  if (status === 'to_install') return 'to_install';
  if (status === 'complete') return 'complete';
  return 'to_pay';
};

const getCategoryCount = (orders, category) => orders.filter((order) => getOrderCategory(order) === category).length;

function ProfileCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile } = useUser();
  const { cart, updateQuantity, removeFromCart, getCartCount, getCartTotal } = useCart();

  const [isEditing, setIsEditing] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressHighlight, setAddressHighlight] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationBusyId, setNotificationBusyId] = useState('');
  const [markingAllNotifications, setMarkingAllNotifications] = useState(false);
  const [activeOrderCategory, setActiveOrderCategory] = useState('to_pay');
  const [hasSelectedOrderCategory, setHasSelectedOrderCategory] = useState(false);
  const profilePicInputRef = useRef(null);
  const addressSectionRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || '',
    });
  }, [user]);

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const response = await apiRequest('/orders/me');
        if (!mounted) return;
        setOrders((response.orders || []).map(normalizeOrder));
      } catch (_error) {
        if (!mounted) return;
        setOrders([]);
      } finally {
        if (mounted) setOrdersLoading(false);
      }
    };

    const loadAddresses = async () => {
      try {
        const response = await apiRequest('/users/addresses');
        if (!mounted) return;
        setAddresses((response.addresses || []).map(normalizeAddress));
      } catch (_error) {
        if (!mounted) return;
        setAddresses([]);
      }
    };

    const loadNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const response = await apiRequest('/notifications/me');
        if (!mounted) return;
        setNotifications((response.notifications || []).map(normalizeNotification));
      } catch (_error) {
        if (!mounted) return;
        setNotifications([]);
      } finally {
        if (mounted) setNotificationsLoading(false);
      }
    };

    loadOrders();
    loadAddresses();
    loadNotifications();

    const pollId = window.setInterval(() => {
      loadOrders();
      loadNotifications();
    }, 25000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadOrders();
        loadNotifications();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      window.clearInterval(pollId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!location.state?.focusAddressForm) return;

    const timer = window.setTimeout(() => setAddressHighlight(false), 2800);
    requestAnimationFrame(() => {
      addressSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setAddressHighlight(true);
    });

    navigate(location.pathname, { replace: true, state: {} });
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (ordersLoading || hasSelectedOrderCategory) return;

    const fallbackCategory = ['to_pay', 'to_deliver', 'to_install', 'complete']
      .find((category) => getCategoryCount(orders, category) > 0) || 'to_pay';
    setActiveOrderCategory(fallbackCategory);
  }, [orders, ordersLoading, hasSelectedOrderCategory]);

  const profileInitial = useMemo(() => {
    const name = form.name || user?.email || 'U';
    return name.charAt(0).toUpperCase();
  }, [form.name, user?.email]);

  const activeCategoryConfig = orderCategoryConfig[activeOrderCategory] || orderCategoryConfig.to_pay;
  const activeOrders = useMemo(
    () => orders.filter((order) => getOrderCategory(order) === activeOrderCategory),
    [orders, activeOrderCategory]
  );

  const orderStats = useMemo(() => [
    { key: 'to_pay', ...orderCategoryConfig.to_pay, count: getCategoryCount(orders, 'to_pay') },
    { key: 'to_deliver', ...orderCategoryConfig.to_deliver, count: getCategoryCount(orders, 'to_deliver') },
    { key: 'to_install', ...orderCategoryConfig.to_install, count: getCategoryCount(orders, 'to_install') },
    { key: 'complete', ...orderCategoryConfig.complete, count: getCategoryCount(orders, 'complete') },
  ], [orders]);

  const onSave = async () => {
    if (!form.name.trim()) {
      alert('Name is required.');
      return;
    }
    if (!form.phone.trim()) {
      alert('Phone number is required.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        avatarUrl: form.avatarUrl,
      });
      alert('Profile saved successfully.');
      setIsEditing(false);
    } catch (error) {
      alert(error.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePickProfilePicture = () => {
    if (!isEditing) return;
    profilePicInputRef.current?.click();
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, avatarUrl: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const refreshAddresses = async () => {
    try {
      const response = await apiRequest('/users/addresses');
      setAddresses((response.addresses || []).map(normalizeAddress));
    } catch (_error) {
      setAddresses([]);
    }
  };

  const unreadNotificationCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  const handleMarkNotificationRead = async (notificationId) => {
    if (!notificationId) return;
    const existing = notifications.find((item) => item.id === notificationId);
    if (!existing || !existing.unread) return;

    setNotificationBusyId(notificationId);
    setNotifications((prev) => prev.map((item) => (
      item.id === notificationId ? { ...item, unread: false } : item
    )));

    try {
      await apiRequest(`/notifications/${notificationId}/read`, { method: 'PATCH' });
    } catch (_error) {
      setNotifications((prev) => prev.map((item) => (
        item.id === notificationId ? { ...item, unread: true } : item
      )));
    } finally {
      setNotificationBusyId('');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!notifications.length || !unreadNotificationCount) return;
    const snapshot = notifications;
    setMarkingAllNotifications(true);
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));

    try {
      await apiRequest('/notifications/me/read-all', { method: 'PATCH' });
    } catch (_error) {
      setNotifications(snapshot);
    } finally {
      setMarkingAllNotifications(false);
    }
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const handleSaveAddress = async (payload) => {
    setSavingAddress(true);
    try {
      if (editingAddress?.id) {
        await apiRequest(`/users/addresses/${editingAddress.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest('/users/addresses', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      await refreshAddresses();
      closeAddressModal();
    } catch (error) {
      alert(error.message || 'Unable to save address right now.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!addressId) return;
    if (!window.confirm('Delete this saved address?')) return;

    setSavingAddress(true);
    try {
      await apiRequest(`/users/addresses/${addressId}`, { method: 'DELETE' });
      await refreshAddresses();
    } catch (error) {
      alert(error.message || 'Unable to delete address right now.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    if (!addressId) return;

    setSavingAddress(true);
    try {
      await apiRequest(`/users/addresses/${addressId}/default`, { method: 'PATCH' });
      await refreshAddresses();
    } catch (error) {
      alert(error.message || 'Unable to set default address right now.');
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/home')} type="button">
            ←
          </button>
          <div>
            <h1>My Profile</h1>
            <p>Manage your account, orders, and saved delivery details</p>
          </div>
        </div>

        <button type="button" className="header-action" onClick={() => navigate('/my-orders')}>
          View Orders
        </button>
      </div>

      <div className="profile-layout">
        <div className="profile-left">
          <div className="card profile-hero-card">
            <div className="profile-hero-top">
              <div className="avatar-large avatar-large--circle" onClick={handlePickProfilePicture} role="presentation">
                {form.avatarUrl ? <img src={form.avatarUrl} alt="Profile" /> : <span>{profileInitial}</span>}
              </div>

              <div className="profile-identity">
                <div className="profile-kicker">Account profile</div>
                {isEditing ? (
                  <input
                    className="input profile-name-input"
                    value={form.name}
                    placeholder="Display name"
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                ) : (
                  <h2 className="profile-name">{form.name || 'User'}</h2>
                )}

                {isEditing ? (
                  <input
                    className="input profile-phone-input"
                    value={form.phone}
                    placeholder="Phone number"
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                ) : (
                  <p className="profile-phone">{form.phone || 'No phone number added'}</p>
                )}

                <div className="profile-hero-actions">
                  {!isEditing ? (
                    <button type="button" className="primary-btn profile-primary-btn" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button type="button" className="primary-btn profile-primary-btn" onClick={onSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button type="button" className="ghost-btn profile-secondary-btn" onClick={() => setIsEditing(false)}>
                        Cancel
                      </button>
                    </>
                  )}
                </div>

                {isEditing && (
                  <div className="profile-picture-actions">
                    <input
                      ref={profilePicInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      style={{ display: 'none' }}
                    />
                    <button type="button" className="ghost-btn" onClick={handlePickProfilePicture}>
                      Change Photo
                    </button>
                    {form.avatarUrl && (
                      <button type="button" className="ghost-btn" onClick={() => setForm((prev) => ({ ...prev, avatarUrl: '' }))}>
                        Remove Photo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Information Section */}
          <div className="card profile-location-card">
            <div className="section-head">
              <div className="profile-kicker">Location details</div>
              <h2 className="section-title">Saved location</h2>
            </div>

            {user?.location ? (
              <div className="profile-location-content">
                {user.location.coordinates?.latitude && user.location.coordinates?.longitude && (
                  <div className="location-coordinates">
                    <div className="coordinate-item">
                      <img src={icons.marker} alt="" className="location-icon" />
                      <div>
                        <strong>GPS Coordinates:</strong>
                        <div>{user.location.coordinates.latitude.toFixed(6)}, {user.location.coordinates.longitude.toFixed(6)}</div>
                        {user.location.coordinates.accuracy && (
                          <div className="accuracy">±{Math.round(user.location.coordinates.accuracy)}m accuracy</div>
                        )}
                        {user.location.coordinates.timestamp && (
                          <div className="timestamp">Captured: {new Date(user.location.coordinates.timestamp).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {user.location.address && (user.location.address.region || user.location.address.province || user.location.address.city) && (
                  <div className="location-address">
                    <div className="address-item">
                      <img src={icons.houseChimney} alt="" className="location-icon" />
                      <div>
                        <strong>Address:</strong>
                        <div>
                          {[
                            user.location.address.street,
                            user.location.address.barangay,
                            user.location.address.city,
                            user.location.address.province,
                            user.location.address.region,
                          ].filter(Boolean).join(', ')}
                          {user.location.address.postalCode && `, ${user.location.address.postalCode}`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="location-meta">
                  <div className="source-info">
                    Source: {user.location.source === 'gps' ? 'GPS Capture' : user.location.source === 'manual' ? 'Manual Entry' : 'IP Geolocation'}
                  </div>
                  {user.location.capturedAt && (
                    <div className="captured-at">
                      Saved: {new Date(user.location.capturedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="profile-location-empty">No location information saved. Location will be captured during registration or can be updated later.</p>
            )}
          </div>

          <div ref={addressSectionRef} className={`card profile-address-card ${addressHighlight ? 'address-highlight' : ''}`}>
            <div className="section-head section-head--spaced">
              <div>
                <div className="profile-kicker">Delivery addresses</div>
                <h2 className="section-title">Saved addresses</h2>
              </div>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  setEditingAddress(null);
                  setShowAddressModal(true);
                }}
              >
                Add Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <p className="profile-address-empty">No saved delivery address yet. Add one to enable checkout.</p>
            ) : (
              <div className="profile-address-list">
                {addresses.map((address) => (
                  <div key={address.id} className="profile-address-item">
                    <div className="profile-address-meta">
                      <strong>{formatAddressLabel(address)}</strong>
                      {address.isDefault && <span className="profile-default-pill">Default</span>}
                    </div>
                    <p>{address.name}</p>
                    <p>{formatFullAddress(address)}{address.postalCode ? `, ${address.postalCode}` : ''}</p>
                    <p>{address.phone}</p>

                    <div className="profile-address-actions">
                      {!address.isDefault && (
                        <button type="button" className="ghost-btn" onClick={() => handleSetDefault(address.id)} disabled={savingAddress}>
                          Set Default
                        </button>
                      )}
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => {
                          setEditingAddress(address);
                          setShowAddressModal(true);
                        }}
                        disabled={savingAddress}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ghost-btn profile-danger-btn"
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={savingAddress}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="profile-right">
          <div className="card profile-orders-card">
            <div className="section-head section-head--spaced">
              <div>
                <div className="profile-kicker">Order tracker</div>
                <h2 className="section-title">Tap a status to inspect orders</h2>
              </div>
            </div>

            <div className="order-tracker-layout">
              <div className="order-stats-grid" role="tablist" aria-label="Order status filters">
                {orderStats.map((stat) => {
                  const active = stat.key === activeOrderCategory;
                  return (
                    <button
                      key={stat.key}
                      type="button"
                      className={`order-stat-card ${active ? 'active' : ''}`}
                      onClick={() => {
                        setActiveOrderCategory(stat.key);
                        setHasSelectedOrderCategory(true);
                      }}
                      aria-pressed={active}
                      aria-label={`${stat.label}, ${stat.count} orders`}
                      title={stat.description}
                    >
                      <span className="order-stat-icon-wrap">
                        <img src={stat.icon} alt="" className="order-stat-icon" aria-hidden="true" />
                      </span>
                      <span className="order-stat-copy">
                        <span className="order-stat-label">{stat.label}</span>
                        <span className="order-stat-count">{stat.count}</span>
                        <span className="order-stat-desc">{stat.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="order-detail-panel" key={activeOrderCategory}>
              <div className="order-detail-panel-head">
                <div>
                  <div className="profile-kicker">Selected category</div>
                  <h3>{activeCategoryConfig.label}</h3>
                </div>
                <span className="order-detail-badge">{activeOrders.length} items</span>
              </div>

              {ordersLoading ? (
                <p className="profile-empty-state">Loading orders...</p>
              ) : activeOrders.length === 0 ? (
                <p className="profile-empty-state">{activeCategoryConfig.emptyText}</p>
              ) : (
                <div className="order-detail-list">
                  {activeOrders.map((order) => (
                    <article key={order.id} className="order-detail-card">
                      <div className="order-detail-card-head">
                        <div>
                          <strong>{order.orderCode || order.id}</strong>
                          <p>{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="order-money">₱ {Number(order.total || 0).toLocaleString()}</div>
                      </div>
                      <div className="order-item-chips" aria-label="Order items">
                        {order.items.slice(0, 4).map((item) => (
                          <span key={`${order.id}-${item.productId || item.id || item.name}`} className="order-item-chip" title={item.name}>
                            {item.name} x{item.quantity}
                          </span>
                        ))}
                        {order.items.length > 4 && (
                          <span className="order-item-chip order-item-chip--muted">+{order.items.length - 4} more</span>
                        )}
                      </div>
                      <div className="order-detail-footer">
                        <span className="order-status-pill">{order.workflowStatus.replace(/_/g, ' ')}</span>
                        <button type="button" className="text-link-btn" onClick={() => navigate('/my-orders')}>
                          Open in My Orders
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>

          <div className="card profile-cart-card">
            <div className="section-head section-head--spaced">
              <div>
                <div className="profile-kicker">Notifications</div>
                <h2 className="section-title">Customer updates</h2>
              </div>
              <button
                type="button"
                className="ghost-btn"
                onClick={handleMarkAllNotificationsRead}
                disabled={!unreadNotificationCount || markingAllNotifications}
              >
                {markingAllNotifications ? 'Marking...' : 'Mark all as read'}
              </button>
            </div>

            {notificationsLoading ? (
              <p className="profile-empty-state">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="profile-empty-state">No notifications yet.</p>
            ) : (
              <div className="profile-notification-list">
                {notifications.slice(0, 6).map((item) => (
                  <article
                    key={item.id}
                    className={`profile-notification-item ${item.unread ? 'unread' : ''}`}
                  >
                    <div className="profile-notification-head">
                      <strong>{item.title}</strong>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <p>{item.message}</p>
                    {item.unread ? (
                      <button
                        type="button"
                        className="text-link-btn"
                        onClick={() => handleMarkNotificationRead(item.id)}
                        disabled={notificationBusyId === item.id}
                      >
                        {notificationBusyId === item.id ? 'Saving...' : 'Mark as read'}
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="card profile-cart-card">
            <div className="section-head section-head--spaced">
              <div>
                <div className="profile-kicker">Cart</div>
                <h2 className="section-title">Quick cart summary</h2>
              </div>
            </div>

            <div className="stat-row">
              <span>Items</span>
              <strong>{getCartCount()}</strong>
            </div>

            <div className="stat-row">
              <span>Total</span>
              <strong>₱ {getCartTotal().toLocaleString()}</strong>
            </div>

            <button type="button" className="primary-btn profile-primary-btn" onClick={() => setIsCartOpen(true)}>
              View Cart
            </button>
          </div>
        </div>
      </div>

      {isCartOpen && <div className="profile-cart-overlay" onClick={() => setIsCartOpen(false)} />}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={() => navigate('/checkout')}
        getCartTotal={getCartTotal}
      />

      {showAddressModal && (
        <AddAddressModal
          onClose={closeAddressModal}
          onSave={handleSaveAddress}
          initialAddress={editingAddress}
          title={editingAddress ? 'Edit Address' : 'Add New Address'}
          saveLabel={editingAddress ? 'Save Changes' : 'Save Address'}
          isSaving={savingAddress}
        />
      )}
    </div>
  );
}

export default ProfileCenter;