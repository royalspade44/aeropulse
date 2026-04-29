import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { apiRequest } from '../../config/api';
import './MyOrders.css';
import OrderCard from './OrderCard';
import TrackOrderModal from './TrackOrderModal';
import CustomerHeaderBrand from '../common/CustomerHeaderBrand';
import Footer from '../home/Footer';

function MyOrders() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);

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
          <div className="customer-header-left-group">
            <button className="back-btn" onClick={handleBack}>←</button>
            <CustomerHeaderBrand />
          </div>
          <div className="customer-header-spacer" />
          <div className="customer-header-right-group">
            <h1 className="orders-title">My Orders</h1>
          </div>
        </div>
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
        ) : (
          orders.map(order => (
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