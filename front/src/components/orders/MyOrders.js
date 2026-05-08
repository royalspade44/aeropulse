import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { apiRequest } from '../../config/api';
import './MyOrders.css';
import OrderCard from './OrderCard';
import TrackOrderModal from './TrackOrderModal';
import Footer from '../home/Footer';

const VALID_ORDER_STATUSES = ['all', 'to_pay', 'to_deliver', 'to_install', 'complete'];

function MyOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status') || 'all';
    setStatusFilter(VALID_ORDER_STATUSES.includes(status) ? status : 'all');
  }, [location.search]);

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      try {
        const response = await apiRequest(`/orders/me?ts=${Date.now()}`);
        if (!mounted) return;
        const normalized = (response.orders || []).map((order) => ({
          ...order,
          id: order.orderCode || order.id,
          date: order.createdAt || order.date,
          total: order.totalAmount || order.total || 0,
          status: order.workflowStatus || order.status,
          items: order.items || [],
          trackingNumber: order.trackingNumber || 'Pending',
          estimatedDelivery: order.estimatedDelivery || '',
          estimatedArrival: order.estimatedArrival || '',
          installationDate: order.installationDate || '',
          assignedTechnician: order.assignedTechnician || '',
          receipt: order.receipt || null,
        }));
        setOrders(normalized);
      } catch (_error) {
        if (!mounted) return;
        if (!localStorage.getItem('accessToken')) {
          const savedOrders = localStorage.getItem('orders');
          if (savedOrders) setOrders(JSON.parse(savedOrders));
        }
      }
    };

    loadOrders();
    const pollId = window.setInterval(loadOrders, 25000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') loadOrders();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      window.clearInterval(pollId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleTrack = (order) => {
    setSelectedOrder(order);
    setShowTrackModal(true);
  };

  const handleReorder = (order) => {
    order.items.forEach(item => {
      addToCart({
        id: item.productId || item.id,
        name: item.name,
        icon: item.icon,
        price: item.price,
        specs: item.specs,
        category: item.category || 'product'
      }, item.quantity);
    });
    alert('Items added to cart!');
    navigate('/shop');
  };

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div className="orders-header-content">
          <button className="back-btn" onClick={handleBack}>←</button>
          <h1 className="orders-title">My Orders</h1>
        </div>
      </div>

      <div className="orders-filter-bar">
        {['all', 'to_pay', 'to_deliver', 'to_install', 'complete'].map((status) => (
          <button
            key={status}
            type="button"
            className={`orders-filter-btn ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="orders-main">
        {orders.length === 0 ? (
          <div className="empty-orders">
            <h3>No Orders Yet</h3>
            <p>You haven't placed any orders yet. Start shopping now!</p>
            <button className="shop-now-btn" onClick={() => navigate('/shop')}>
              Shop Now →
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <h3>No Orders Match</h3>
            <p>No orders match the selected status. Try a different filter.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onTrack={handleTrack}
              onReorder={handleReorder}
            />
          ))
        )}
      </div>

      {showTrackModal && selectedOrder && (
        <TrackOrderModal
          order={selectedOrder}
          onClose={() => {
            setShowTrackModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
      <Footer />
    </div>
  );
}

export default MyOrders;