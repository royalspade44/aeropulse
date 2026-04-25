import { useCart } from '../../context/CartContext';
import icons from '../common/icons';

function Header({ onMenuToggle, onNotificationClick, onCartClick, notificationCount, scrolled }) {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const formatBadgeCount = (count) => {
    const normalized = Number(count) || 0;
    if (normalized <= 0) return '';
    if (normalized > 99) return '99+';
    return String(normalized);
  };

  const notificationBadge = formatBadgeCount(notificationCount);
  const cartBadge = formatBadgeCount(cartCount);

  return (
    <header className={`home-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <div className="header-left">
          <button type="button" className="menu-toggle" onClick={onMenuToggle} aria-label="Open menu">
            <img src={icons.customize} alt="" className="inline-icon inline-icon--md" />
          </button>
          <div className="logo">
            <div className="logo-icon">CA</div>
            <div className="logo-text">
              <h1>COLD AIR</h1>
              <p>Airconditioning Trading</p>
            </div>
          </div>
        </div>
        <div className="header-right" aria-label="Header actions">
          <button type="button" className="icon-btn header-action-btn" onClick={onNotificationClick} aria-label="Notifications">
            <img src={icons.visit} alt="" className="inline-icon inline-icon--md" />
            {notificationBadge && (
              <span className="badge" aria-live="polite">{notificationBadge}</span>
            )}
          </button>
          <button type="button" className="icon-btn header-action-btn" onClick={onCartClick} aria-label="Cart">
            <img src={icons.cartShoppingFast} alt="" className="inline-icon inline-icon--md" />
            {cartBadge && <span className="badge" aria-live="polite">{cartBadge}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
