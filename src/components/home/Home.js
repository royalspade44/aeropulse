import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import './Home.css';
import Header from './Header';
import SideMenu from './SideMenu';
import NotificationsModal from './NotificationsModal';
import CartModal from '../shop/CartSidebar';
import HeroSection from './HeroSection';
import BrandsSection from './BrandsSection';
import InfoSection from './InfoSection';
import Footer from './Footer';
import icons from '../common/icons';

function Home() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { logout } = useUser();
  
  // State Management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage] = useState('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Track scroll for header effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Notifications Data
  const [notifications] = useState([
    { 
      id: 1, 
      title: 'Welcome!', 
      message: 'Thank you for joining Cold Air', 
      time: 'Just now', 
      unread: true 
    },
    { 
      id: 2, 
      title: 'Special Offer', 
      message: '20% off on all AC services this week!', 
      time: '2 hours ago', 
      unread: true 
    },
    { 
      id: 3, 
      title: 'Booking Confirmed', 
      message: 'Your service appointment is confirmed', 
      time: 'Yesterday', 
      unread: false 
    },
  ]);

  // Brand Data - Matches the structure in BrandsSection.js
  const brands = [
    { 
      id: 1, 
      name: 'Midea', 
      iconSrc: icons.temperatureFrigid,
      logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvl2GSFigO4nNXMWW1qO_VZ1GZwjVl5alpsw&s',
      description: 'Premium AC Solutions'
    },
    { 
      id: 2, 
      name: 'TCL', 
      iconSrc: icons.wind,
      logoUrl: 'https://cdn.manilastandard.net/wp-content/uploads/2023/02/TCL.png',
      description: 'Smart Air Conditioning'
    },
    { 
      id: 3, 
      name: 'Aux', 
      iconSrc: icons.tools,
      logoUrl: 'https://auxaircon.com.ph/images/aux_logo.png',
      description: 'Energy Efficient'
    },
    { 
      id: 4, 
      name: 'Samsung', 
      iconSrc: icons.customize,
      logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXFVQh2BQhYtWf9APXNliSnNTi7MBwV6yPFA&s',
      description: 'Innovation Technology'
    },
    { 
      id: 5, 
      name: 'Daikin', 
      iconSrc: icons.checkCircle,
      logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwu8SCQH4joBnn0HXF5F_HQKBRb85KZ8ZkuA&s',
      description: 'World Leader in AC'
    },
    { 
      id: 6, 
      name: 'Carrier', 
      iconSrc: icons.wind,
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Logo_of_the_Carrier_Corporation.svg',
      description: 'Inventor of AC'
    },
    { 
      id: 7, 
      name: 'LG', 
      iconSrc: icons.bolt,
      logoUrl: 'https://www.lg.com/content/dam/lge/common/logo/logo-lg-100-44.jpg',
      description: 'Life\'s Good'
    },
    { 
      id: 8, 
      name: 'American Home', 
      iconSrc: icons.houseChimney,
      logoUrl: 'https://ansons.ph/wp-content/uploads/2024/05/aham.jpg',
      description: 'Home Comfort Solutions'
    },
    { 
      id: 9, 
      name: 'Gree', 
      iconSrc: icons.wind,
      logoUrl: 'https://1000logos.net/wp-content/uploads/2018/08/Gree-Logo.png',
      description: 'Eco-Friendly Cooling'
    },
  ];

  // Handlers
  const handleLogout = () => {
    const keysToRemove = [
      'currentUser',
      'cart',
      'addresses',
      'orders',
      'ac_units',
      'failed_attempts_',
      'aeropulse_users'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    logout();
    clearCart();
    navigate('/login');
  };

  const handleBookNow = () => {
    navigate('/services');
  };

  const handleCheckout = () => {
    navigate('/checkout');
    setShowCart(false);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowCart(false);
  };

  const handleCartClick = () => {
    setShowCart(!showCart);
    setShowNotifications(false);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="home-container">
      {/* Header with scroll effect */}
      <Header
        onMenuToggle={handleMenuToggle}
        onNotificationClick={handleNotificationClick}
        onCartClick={handleCartClick}
        notificationCount={unreadCount}
        scrolled={scrolled}
      />

      {/* Side Menu */}
      <SideMenu
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        activePage={activePage}
        onLogout={handleLogout}
      />

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="menu-overlay" 
          onClick={handleMenuClose}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
        getCartTotal={getCartTotal}
      />

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <HeroSection onBookNow={handleBookNow} />
        
        {/* Brands Section - Pass the brands data */}
        <BrandsSection brands={brands} />
        
        {/* Info Section */}
        <InfoSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;