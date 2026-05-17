import {
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  TwitterLogo,
} from "@phosphor-icons/react";
import { BQ_COLORS, BQ_FONTS, BQ_SHADOWS, BQ_WEIGHTS } from "./BoutiqueTheme";

/**
 * BOUTIQUE FOOTER
 * CLEANED: Now uses centralized tokens and standardized weights.
 */
export default function BoutiqueFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bq-footer">
      <div className="bq-footer-content">
        <div className="bq-footer-brand">
          <h2 className="bq-footer-title">AeroPulse</h2>
          <p className="bq-footer-text">
            The definitive boutique destination for premium air conditioning
            solutions. Experience the art of perfect cooling.
          </p>
          <div className="bq-social-links">
            <button className="bq-social-btn">
              <FacebookLogo size={20} weight="bold" />
            </button>
            <button className="bq-social-btn">
              <TwitterLogo size={20} weight="bold" />
            </button>
            <button className="bq-social-btn">
              <InstagramLogo size={20} weight="bold" />
            </button>
            <button className="bq-social-btn">
              <LinkedinLogo size={20} weight="bold" />
            </button>
          </div>
        </div>

        <div className="bq-footer-column">
          <h4 className="bq-footer-title">Collections</h4>
          <ul className="bq-footer-links">
            <li>
              <a href="/shop?cat=split">Split Type</a>
            </li>
            <li>
              <a href="/shop?cat=window">Window Type</a>
            </li>
            <li>
              <a href="/shop?cat=floor">Floor Type</a>
            </li>
            <li>
              <a href="/shop?cat=portable">Portable Units</a>
            </li>
          </ul>
        </div>

        <div className="bq-footer-column">
          <h4 className="bq-footer-title">Experience</h4>
          <ul className="bq-footer-links">
            <li>
              <a href="/services">Book Service</a>
            </li>
            <li>
              <a href="/myunit">My Units</a>
            </li>
            <li>
              <a href="/contact">Support</a>
            </li>
            <li>
              <a href="/faq">FAQ</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="bq-footer-bottom">
        <p>© {currentYear} AeroPulse Boutique. All rights reserved.</p>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-footer {
          background: ${BQ_COLORS.bgAlt};
          color: ${BQ_COLORS.ink};
          padding: 80px 40px 40px;
          margin-top: auto;
          border-top: 1px solid ${BQ_COLORS.border};
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
          font-size: 13px; font-weight: ${BQ_WEIGHTS.bold};
          text-transform: uppercase; letter-spacing: 0.25em;
          color: ${BQ_COLORS.ink}; margin-bottom: 32px;
          opacity: 0.8;
        }

        .bq-footer-text {
          font-size: 15px; color: ${BQ_COLORS.inkMuted};
          line-height: 1.7; margin-bottom: 32px;
          max-width: 340px;
          font-weight: ${BQ_WEIGHTS.medium};
        }

        .bq-footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; }
        .bq-footer-links a {
          color: ${BQ_COLORS.inkMuted}; text-decoration: none;
          font-size: 15px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-weight: ${BQ_WEIGHTS.semibold};
        }
        .bq-footer-links a:hover { color: ${BQ_COLORS.accent}; transform: translateX(8px); }

        .bq-social-links { display: flex; gap: 12px; }
        .bq-social-btn {
          width: 48px; height: 48px; background: white;
          border: 1px solid ${BQ_COLORS.border}; border-radius: 14px; color: ${BQ_COLORS.ink};
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: ${BQ_SHADOWS.soft};
        }
        .bq-social-btn:hover { background: ${BQ_COLORS.brand}; color: white; transform: translateY(-6px) scale(1.1); box-shadow: ${BQ_SHADOWS.float}; border-color: transparent; }

        .bq-footer-bottom {
          max-width: 1400px; margin: 0 auto;
          padding-top: 40px; border-top: 1px solid ${BQ_COLORS.border};
          text-align: center; font-size: 13px; color: ${BQ_COLORS.inkFaint};
          font-weight: ${BQ_WEIGHTS.semibold}; text-transform: uppercase; letter-spacing: 0.1em;
        }

        @media (max-width: 768px) {
          .bq-footer-content { grid-template-columns: 1fr; gap: 48px; }
          .bq-footer { padding-top: 64px; }
        }
      `,
        }}
      />
    </footer>
  );
}
