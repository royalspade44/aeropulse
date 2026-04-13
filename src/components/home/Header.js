import { useCart } from '../../context/CartContext';
import icons from '../common/icons';

function Header({ onMenuToggle, onNotificationClick, onCartClick, notificationCount }) {
  const { getCartCount } = useCart();

  return (
    <header className="home-header">
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
        <div className="header-right">
          <button type="button" className="icon-btn" onClick={onNotificationClick} aria-label="Notifications">
            <img src={icons.visit} alt="" className="inline-icon inline-icon--md" />
            {notificationCount > 0 && (
              <span className="badge">{notificationCount}</span>
            )}
          </button>
          <button type="button" className="icon-btn" onClick={onCartClick} aria-label="Cart">
            <img src={icons.cartShoppingFast} alt="" className="inline-icon inline-icon--md" />
            {getCartCount() > 0 && <span className="badge">{getCartCount()}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
