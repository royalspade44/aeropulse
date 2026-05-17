import {
    ArrowLeft,
    Bell,
    List,
    ShoppingCartSimple,
    WarningDiamond
} from "@phosphor-icons/react";
import coldAirLogo from '../images/Cold Air Logo.jpg';
import { BQ_COLORS, BQ_FONTS, BQ_GEOMETRY, BQ_SHADOWS } from './BoutiqueTheme';

export default function BoutiqueHeader({
  variant = "text", // "text" for Shop, "logo" for Home
  title = "Shop AC Units",
  leftAction = "back", // "back" or "menu"
  onLeftAction,
  onNotificationClick,
  onCartClick,
  notificationCount = 0,
  cartCount = 0,
  isAuthenticated = false,
  scrolled = false
}) {
  return (
    <header className={`bq-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="bq-header-content">
        {/* LEFT: Action + Identity */}
        <div className="bq-header-left">
          <button className="bq-action-btn" onClick={onLeftAction}>
            {leftAction === "back" ? <ArrowLeft size={18} weight="bold" /> : <List size={22} weight="bold" />}
          </button>

          {variant === "logo" ? (
            <div className="bq-logo-group">
              <img src={coldAirLogo} alt="Cold Air" className="bq-logo-img" />
              <div className="bq-logo-text">
                <span className="bq-logo-main">COLD AIR</span>
                <span className="bq-logo-sub">Airconditioning Trading</span>
              </div>
            </div>
          ) : (
            <h1 className="bq-title-text">{title}</h1>
          )}
        </div>

        {/* CENTER: Status (Hidden on mobile usually) */}
        {!isAuthenticated && (
          <div className="bq-header-center">
            <div className="bq-status-pill">
              <WarningDiamond size={18} weight="bold" />
              <span>Guest Mode. <strong>Login to checkout.</strong></span>
            </div>
          </div>
        )}

        {/* RIGHT: Global Actions */}
        <div className="bq-header-right">
          {onNotificationClick && (
            <button className="bq-action-btn bq-notif-btn" onClick={onNotificationClick}>
              <Bell size={22} weight="bold" />
              {notificationCount > 0 && <span className="bq-badge bq-badge--danger">{notificationCount}</span>}
            </button>
          )}

          <button className="bq-cart-trigger" onClick={onCartClick}>
            <ShoppingCartSimple size={22} weight="bold" />
            {cartCount > 0 && <span className="bq-badge bq-badge--cart">{cartCount}</span>}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bq-header {
          height: ${BQ_GEOMETRY.headerHeight};
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          position: sticky;
          top: 0;
          z-index: 1100;
          flex-shrink: 0;
          box-shadow: ${BQ_SHADOWS.glass};
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }

        .bq-header.scrolled {
          background: rgba(255, 255, 255, 0.98);
          height: 72px;
        }

        .bq-header-content {
          width: 100%;
          padding: 0 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bq-header-left { display: flex; align-items: center; gap: 20px; }

        .bq-action-btn {
          background: ${BQ_COLORS.surface};
          border: none;
          width: 44px;
          height: 44px;
          border-radius: ${BQ_GEOMETRY.radiusPill};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: ${BQ_COLORS.ink};
          box-shadow: ${BQ_SHADOWS.soft};
          position: relative;
        }

        .bq-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: ${BQ_SHADOWS.float};
        }

        .bq-logo-group { display: flex; align-items: center; gap: 12px; }
        .bq-logo-img { height: 40px; width: 40px; border-radius: 8px; object-fit: cover; }
        .bq-logo-text { display: flex; flex-direction: column; }
        .bq-logo-main {
          font-family: ${BQ_FONTS.heading}; font-size: 18px; font-weight: 900;
          letter-spacing: -0.02em; color: ${BQ_COLORS.ink}; line-height: 1;
        }
        .bq-logo-sub { font-size: 10px; font-weight: 700; color: ${BQ_COLORS.inkMuted}; text-transform: uppercase; letter-spacing: 0.05em; }

        .bq-title-text {
          font-family: ${BQ_FONTS.heading};
          font-size: 24px; font-weight: 800;
          letter-spacing: -0.04em; margin: 0;
          color: ${BQ_COLORS.ink};
        }

        .bq-header-center { flex: 1; display: flex; justify-content: center; }

        .bq-status-pill {
          background: #fffbeb;
          padding: 10px 24px;
          border-radius: ${BQ_GEOMETRY.radiusPill};
          display: flex; align-items: center; gap: 12px;
          color: #92400e; font-size: 13px; font-family: ${BQ_FONTS.heading};
          font-weight: 600; box-shadow: ${BQ_SHADOWS.soft};
        }

        .bq-header-right { display: flex; align-items: center; gap: 16px; }

        .bq-cart-trigger {
          position: relative;
          background: ${BQ_COLORS.brand};
          color: white; border: none;
          padding: 12px 18px; border-radius: ${BQ_GEOMETRY.radiusPill};
          cursor: pointer; transition: all 0.3s ease;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        .bq-cart-trigger:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
          background: ${BQ_COLORS.brandHover};
        }

        .bq-badge {
          position: absolute;
          top: -4px; right: -4px;
          color: white; font-size: 10px;
          font-family: ${BQ_FONTS.heading}; font-weight: 800;
          min-width: 20px; height: 20px;
          display: flex; align-items: center; justify-content: center;
          border-radius: ${BQ_GEOMETRY.radiusPill};
          border: 2px solid white;
        }
        .bq-badge--danger { background: ${BQ_COLORS.danger}; top: 4px; right: 4px; }
        .bq-badge--cart { background: ${BQ_COLORS.danger}; }

        @media (max-width: 900px) {
          .bq-header-center { display: none; }
          .bq-logo-sub { display: none; }
        }
      ` }} />
    </header>
  );
}
