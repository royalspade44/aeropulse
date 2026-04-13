import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './MyOrders.css';
import OrderCard from './OrderCard';
import TrackOrderModal from './TrackOrderModal';
import Footer from '../home/Footer';

function MyOrders() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);

  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  const handleTrack = (order) => {
    setSelectedOrder(order);
    setShowTrackModal(true);
  };

  const handleReorder = (order) => {
    order.items.forEach(item => {
      addToCart({
        id: item.id,
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