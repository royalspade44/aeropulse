import { CalendarCheck, ShoppingBag } from "@phosphor-icons/react";
import { BQ_COLORS, BQ_FONTS, BQ_GEOMETRY, BQ_SHADOWS } from '../common/boutique/BoutiqueTheme';

export default function HomeHero({ onBookNow, onShop }) {
  return (
    <section className="home-hero">
      <div className="hero-content">
        <span className="hero-badge">AeroPulse Premium</span>
        <h1 className="hero-title">Experience the Art of <br/>Perfect Cooling.</h1>
        <p className="hero-subtitle">
          From high-performance Inverter ACs to precision maintenance services.
          We bring boutique comfort to your living space.
        </p>

        <div className="hero-actions">
          <button className="hero-btn hero-btn-primary" onClick={onShop}>
            Shop Collections <ShoppingBag size={20} weight="bold" />
          </button>
          <button className="hero-btn hero-btn-secondary" onClick={onBookNow}>
            Book Service <CalendarCheck size={20} weight="bold" />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .home-hero {
          position: relative;
          padding: 120px 40px;
          background: ${BQ_COLORS.bgAlt};
          overflow: hidden;
          display: flex;
          justify-content: center;
          text-align: center;
        }

        .hero-content {
          max-width: 800px;
          position: relative;
          z-index: 10;
        }

        .hero-badge {
          display: inline-block;
          padding: 8px 16px;
          background: ${BQ_COLORS.surface};
          color: ${BQ_COLORS.accent};
          border-radius: ${BQ_GEOMETRY.radiusPill};
          font-family: ${BQ_FONTS.heading};
          font-weight: 800;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          box-shadow: ${BQ_SHADOWS.soft};
          margin-bottom: 32px;
        }

        .hero-title {
          font-family: ${BQ_FONTS.heading};
          font-size: 64px;
          font-weight: 900;
          line-height: 1.1;
          color: ${BQ_COLORS.ink};
          letter-spacing: -0.04em;
          margin-bottom: 24px;
        }

        .hero-subtitle {
          font-size: 20px;
          color: ${BQ_COLORS.inkMuted};
          line-height: 1.6;
          margin-bottom: 48px;
        }

        .hero-actions {
          display: flex;
          gap: 20px;
          justify-content: center;
        }

        .hero-btn {
          padding: 20px 40px;
          border-radius: ${BQ_GEOMETRY.radiusPill};
          font-family: ${BQ_FONTS.heading};
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 12px;
          border: none;
        }

        .hero-btn-primary {
          background: ${BQ_COLORS.brand};
          color: white;
          box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        .hero-btn-primary:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 45px rgba(0,0,0,0.2);
          background: ${BQ_COLORS.brandHover};
        }

        .hero-btn-secondary {
          background: ${BQ_COLORS.surface};
          color: ${BQ_COLORS.ink};
          box-shadow: ${BQ_SHADOWS.soft};
        }
        .hero-btn-secondary:hover {
          transform: translateY(-4px);
          box-shadow: ${BQ_SHADOWS.float};
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 40px; }
          .hero-actions { flex-direction: column; width: 100%; }
          .hero-btn { width: 100%; justify-content: center; }
        }
      ` }} />
    </section>
  );
}
