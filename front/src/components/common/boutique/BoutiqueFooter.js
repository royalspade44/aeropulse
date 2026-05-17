import { FacebookLogo, InstagramLogo, LinkedinLogo, TwitterLogo } from "@phosphor-icons/react";
import { BQ_COLORS, BQ_FONTS } from './BoutiqueTheme';

export default function BoutiqueFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bq-footer">
      <div className="bq-footer-content">
        <div className="bq-footer-section">
          <h4 className="bq-footer-title">AeroPulse</h4>
          <p className="bq-footer-text">
            The definitive boutique destination for premium air conditioning solutions.
            Experience the art of perfect cooling.
          </p>
          <div className="bq-social-links">
            <button className="bq-social-btn"><FacebookLogo size={20} weight="bold" /></button>
            <button className="bq-social-btn"><TwitterLogo size={20} weight="bold" /></button>
            <button className="bq-social-btn"><InstagramLogo size={20} weight="bold" /></button>
            <button className="bq-social-btn"><LinkedinLogo size={20} weight="bold" /></button>
          </div>
        </div>

        <div className="bq-footer-section">
          <h4 className="bq-footer-title">Collections</h4>
          <ul className="bq-footer-links">
            <li><a href="/shop?cat=split">Split Type AC</a></li>
            <li><a href="/shop?cat=window">Window Type AC</a></li>
            <li><a href="/shop?cat=floor">Floor Mounted</a></li>
            <li><a href="/shop?cat=portable">Portable Units</a></li>
          </ul>
        </div>

        <div className="bq-footer-section">
          <h4 className="bq-footer-title">Experience</h4>
          <ul className="bq-footer-links">
            <li><a href="/services">Book Service</a></li>
            <li><a href="/myunit">My Units</a></li>
            <li><a href="/contact">Support</a></li>
            <li><a href="/faq">FAQ</a></li>
          </ul>
        </div>
      </div>

      <div className="bq-footer-bottom">
        <p>© {currentYear} AeroPulse Boutique. All rights reserved.</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bq-footer {
          background: ${BQ_COLORS.ink};
          color: white;
          padding: 100px 40px 40px;
          margin-top: auto;
        }

        .bq-footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 64px;
          margin-bottom: 80px;
        }

        .bq-footer-title {
          font-family: ${BQ_FONTS.heading};
          font-size: 14px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.2em;
          color: white; margin-bottom: 32px;
        }

        .bq-footer-text {
          font-size: 15px; color: ${BQ_COLORS.inkFaint};
          line-height: 1.7; margin-bottom: 32px;
          max-width: 340px;
        }

        .bq-footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; }
        .bq-footer-links a {
          color: ${BQ_COLORS.inkFaint}; text-decoration: none;
          font-size: 15px; transition: all 0.3s;
          font-weight: 500;
        }
        .bq-footer-links a:hover { color: white; transform: translateX(4px); }

        .bq-social-links { display: flex; gap: 12px; }
        .bq-social-btn {
          width: 44px; height: 44px; background: rgba(255,255,255,0.05);
          border: none; border-radius: 12px; color: white;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.3s;
        }
        .bq-social-btn:hover { background: ${BQ_COLORS.accent}; transform: translateY(-4px); }

        .bq-footer-bottom {
          max-width: 1400px; margin: 0 auto;
          padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.05);
          text-align: center; font-size: 13px; color: ${BQ_COLORS.inkFaint};
        }

        @media (max-width: 768px) {
          .bq-footer-content { grid-template-columns: 1fr; gap: 48px; }
          .bq-footer { padding-top: 64px; }
        }
      ` }} />
    </footer>
  );
}
