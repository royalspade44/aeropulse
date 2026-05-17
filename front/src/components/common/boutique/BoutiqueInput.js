import { Eye, EyeSlash, WarningDiamond } from "@phosphor-icons/react";
import { useState } from "react";
import { BQ_COLORS, BQ_GEOMETRY, BQ_SHADOWS } from "./BoutiqueTheme";

/**
 * BOUTIQUE INPUT
 * Unified field element for text, password, tel, number, and select.
 * Handles dynamic icon/border color synchronization using CSS variables.
 */
export default function BoutiqueInput({
  label,
  icon: Icon,
  type = "text",
  status = null, // null, 'error', 'success'
  errorMessage,
  hint,
  options = [], // For select type
  inlineAction, // For buttons inside the field (e.g., Verify)
  children, // For block content below the field (e.g., Strength Meter)
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  const getStatusClass = () => {
    if (status === "error") return "bq-input--error";
    if (status === "success") return "bq-input--success";
    return "";
  };

  return (
    <div className={`bq-input-group ${getStatusClass()}`}>
      {label && <label className="bq-input-label">{label}</label>}

      <div className="bq-input-field-area">
        {Icon && <Icon size={18} weight="bold" className="bq-input-icon" />}

        {type === "select" ? (
          <select
            className={`bq-input-field bq-input-select ${isPassword ? "has-pass" : ""} ${inlineAction ? "has-action" : ""}`}
            {...props}
          >
            {props.placeholder && <option value="">{props.placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={actualType}
            className={`bq-input-field ${isPassword ? "has-pass" : ""} ${inlineAction ? "has-action" : ""}`}
            {...props}
          />
        )}

        {/* Right-side overlays */}
        <div className="bq-input-overlays">
          {isPassword && (
            <button
              type="button"
              className="bq-input-pass-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          )}
          {inlineAction}
        </div>
      </div>

      {children}

      {status === "error" && errorMessage && (
        <div className="bq-input-error-msg bq-slide-down">
          <WarningDiamond size={14} weight="bold" />
          <span>{errorMessage}</span>
        </div>
      )}

      {hint && <p className="bq-input-hint">{hint}</p>}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          --field-accent: ${BQ_COLORS.inkFaint};
        }

        .bq-input-label {
          font-size: 13px;
          font-weight: 700;
          color: ${BQ_COLORS.ink};
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .bq-input-field-area {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          transition: all 0.3s ease;
        }

        .bq-input-field {
          width: 100%;
          padding: 16px 20px;
          padding-left: ${Icon ? "48px" : "20px"};
          padding-right: 20px;
          background: ${BQ_COLORS.surfaceAlt};
          border: 1.5px solid var(--field-accent);
          border-radius: ${BQ_GEOMETRY.radiusMd};
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: ${BQ_COLORS.ink};
          transition: all 0.3s ease;
          outline: none;
        }

        /* Responsive Right Padding */
        .bq-input-field.has-pass { padding-right: 54px; }
        .bq-input-field.has-action { padding-right: 88px; }
        .bq-input-field.has-pass.has-action { padding-right: 120px; }

        .bq-input-field:focus { background: white; box-shadow: ${BQ_SHADOWS.soft}; }

        .bq-input-icon {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          color: var(--field-accent); z-index: 5; transition: color 0.3s ease;
        }

        .bq-input-overlays {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 10;
        }

        .bq-input-group:focus-within { --field-accent: ${BQ_COLORS.brand}; }
        .bq-input--error { --field-accent: ${BQ_COLORS.danger} !important; }
        .bq-input--success { --field-accent: ${BQ_COLORS.success} !important; }

        .bq-input--error .bq-input-field { background: #fffafb; }
        .bq-input--success .bq-input-field { background: #fafffb; }

        .bq-input-pass-toggle {
          background: transparent; border: none; cursor: pointer;
          color: var(--field-accent); display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; width: 32px; height: 32px;
        }
        .bq-input-pass-toggle:hover { filter: brightness(0.8); transform: scale(1.1); }

        .bq-input-error-msg {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: ${BQ_COLORS.danger}; font-weight: 700; margin-top: 4px; padding-left: 4px;
        }

        .bq-input-hint { font-size: 11px; color: ${BQ_COLORS.inkMuted}; margin-top: 4px; font-weight: 600; }

        /* Unified status badge styles used by VerifyInput and Steps */
        .bq-verified-badge {
          color: ${BQ_COLORS.success};
          display: flex;
          align-items: center;
          animation: fadeIn 0.3s ease;
        }
      `,
        }}
      />
    </div>
  );
}
