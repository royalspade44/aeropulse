import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import icons from '../common/icons';
import { useUser } from '../../context/UserContext';
import { apiRequest } from '../../config/api';
import './ProfileCenter.css';

const normalizeOrder = (order = {}) => ({
  id: String(order.id || order.orderCode || ''),
  orderCode: String(order.orderCode || order.id || ''),
  createdAt: String(order.createdAt || order.date || ''),
  total: Number(order.totalAmount || order.total || 0),
  workflowStatus: String(order.workflowStatus || order.status || 'to_pay'),
  paymentMethod: String(order.paymentMethod || ''),
  receipt: order.receipt || null,
  items: Array.isArray(order.items) ? order.items : [],
});

const orderCategoryConfig = {
  to_pay: {
    label: 'To Pay',
    icon: icons.cartShoppingFast,
    description: 'Unpaid orders',
  },
  to_deliver: {
    label: 'To Deliver',
    icon: icons.boxOpen,
    description: 'Pending delivery items',
  },
  to_install: {
    label: 'To Install',
    icon: icons.tools,
    description: 'Awaiting installation',
  },
  complete: {
    label: 'Completed',
    icon: icons.checkCircle,
    description: 'Finished or archived orders',
  },
};

const getOrderCategory = (order) => {
  const status = order.workflowStatus;
  if (status === 'to_deliver') return 'to_deliver';
  if (status === 'to_install') return 'to_install';
  if (status === 'complete') return 'complete';
  return 'to_pay';
};

const getCategoryCount = (orders, category) => orders.filter((order) => getOrderCategory(order) === category).length;

const formatDate = (value) => {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

function ProfileCenter() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

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

    loadOrders();

    const pollId = window.setInterval(loadOrders, 25000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadOrders();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      window.clearInterval(pollId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const orderStats = useMemo(() => [
    { key: 'to_pay', ...orderCategoryConfig.to_pay, count: getCategoryCount(orders, 'to_pay') },
    { key: 'to_deliver', ...orderCategoryConfig.to_deliver, count: getCategoryCount(orders, 'to_deliver') },
    { key: 'to_install', ...orderCategoryConfig.to_install, count: getCategoryCount(orders, 'to_install') },
    { key: 'complete', ...orderCategoryConfig.complete, count: getCategoryCount(orders, 'complete') },
  ], [orders]);

  const displayName = user?.name || user?.email || 'User';

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/home')} type="button">
            ←
          </button>
          <div>
            <h1>{displayName}</h1>
            <p>Review your purchase status and contact support if needed.</p>
          </div>
        </div>

        <button type="button" className="header-action" onClick={() => navigate('/my-orders')}>
          View Orders
        </button>
      </div>

      <div className="profile-layout">
        <div className="profile-left">
          <div className="card profile-hero-card">
            <div className="profile-hero-top" style={{ alignItems: 'flex-start', gap: '24px' }}>
              <div className="avatar-large">
                <span>{displayName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="profile-identity">
                <div className="profile-kicker">Account profile</div>
                <h2 className="profile-name">{displayName}</h2>
                <p className="profile-phone">Tap a purchase status to inspect orders or contact support.</p>
                <div className="profile-hero-actions" style={{ marginTop: '20px' }}>
                  <button type="button" className="ghost-btn" onClick={() => navigate('/contact')}>
                    Help Center
                  </button>
                  <button type="button" className="primary-btn" onClick={() => navigate('/contact')}>
                    Chat with Cold Air
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card profile-orders-card">
            <div className="section-head section-head--spaced">
              <div>
                <div className="profile-kicker">My Purchases</div>
                <p className="section-subtitle">Tap a status to inspect orders</p>
              </div>
              <button type="button" className="ghost-btn" onClick={() => navigate('/my-orders')}>
                View all orders
              </button>
            </div>

            <div className="order-stats-grid" role="tablist" aria-label="Order status filters" style={{ marginTop: '24px' }}>
              {orderStats.map((stat) => (
                <button
                  key={stat.key}
                  type="button"
                  className="order-stat-card"
                  onClick={() => navigate(`/my-orders?status=${stat.key}`)}
                  aria-label={`${stat.label}, ${stat.count} orders`}
                  title={stat.description}
                  style={{ minHeight: '120px' }}
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
              ))}
            </div>

            {ordersLoading ? (
              <p className="profile-empty-state" style={{ marginTop: '24px' }}>Loading orders...</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCenter;
