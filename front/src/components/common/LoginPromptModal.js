import { UserCircle } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import {
  BQ_COLORS,
  BQ_FONTS,
  BQ_GEOMETRY,
  BQ_SHADOWS,
} from "./boutique/BoutiqueTheme";

export default function LoginPromptModal({ isOpen, onClose, message }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      <div className="bq-prompt-overlay" onClick={onClose} />
      <div className="bq-prompt-modal">
        <div className="bq-prompt-icon">
          <UserCircle size={48} weight="duotone" color={BQ_COLORS.brand} />
        </div>
        <h2 className="bq-prompt-title">Identity Required</h2>
        <p className="bq-prompt-msg">
          {message || "Please sign in to access this feature."}
        </p>

        <div className="bq-prompt-actions">
          <button
            className="bq-prompt-btn bq-prompt-btn--ghost"
            onClick={onClose}
          >
            Dismiss
          </button>
          <button
            className="bq-prompt-btn bq-prompt-btn--primary"
            onClick={() => {
              onClose();
              navigate("/login");
            }}
          >
            Sign In
          </button>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-prompt-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px);
          z-index: 3000; animation: fadeIn 0.3s ease;
        }

        .bq-prompt-modal {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 100%; max-width: 400px; background: white; border-radius: ${BQ_GEOMETRY.radiusCard};
          padding: 40px; z-index: 3001; display: flex; flex-direction: column; align-items: center;
          text-align: center; box-shadow: ${BQ_SHADOWS.float}; animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .bq-prompt-icon { margin-bottom: 24px; }

        .bq-prompt-title {
          font-family: ${BQ_FONTS.heading}; font-size: 24px; font-weight: 800;
          color: ${BQ_COLORS.ink}; margin: 0 0 12px;
        }

        .bq-prompt-msg { font-size: 16px; color: ${BQ_COLORS.inkMuted}; line-height: 1.5; margin: 0 0 32px; }

        .bq-prompt-actions { display: flex; gap: 12px; width: 100%; }

        .bq-prompt-btn {
          flex: 1; padding: 14px; border-radius: ${BQ_GEOMETRY.radiusPill};
          font-family: ${BQ_FONTS.heading}; font-weight: 800; font-size: 14px;
          text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer;
          transition: all 0.3s; border: none;
        }

        .bq-prompt-btn--primary { background: ${BQ_COLORS.brand}; color: white; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .bq-prompt-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(0,0,0,0.2); }

        .bq-prompt-btn--ghost { background: transparent; color: ${BQ_COLORS.inkMuted}; }
        .bq-prompt-btn--ghost:hover { background: ${BQ_COLORS.bgAlt}; color: ${BQ_COLORS.ink}; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, -40%); } to { opacity: 1; transform: translate(-50%, -50%); } }
      `,
        }}
      />
    </>
  );
}
