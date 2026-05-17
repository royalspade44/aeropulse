import { Check } from "@phosphor-icons/react";
import { BQ_COLORS, BQ_GEOMETRY, BQ_SHADOWS } from "./BoutiqueTheme";

/**
 * BOUTIQUE CHECKBOX
 * High-fidelity themed checkbox component.
 */
export default function BoutiqueCheckbox({
  label,
  checked,
  onChange,
  error,
  children,
  ...props
}) {
  return (
    <div className={`bq-checkbox-group ${error ? "has-error" : ""}`}>
      <label className={`bq-checkbox-wrapper ${checked ? "checked" : ""}`}>
        <div className="bq-checkbox-hit-area">
          <input
            type="checkbox"
            className="bq-checkbox-input"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            {...props}
          />
          <div className={`bq-checkbox-box ${checked ? "checked" : ""}`}>
            {checked && <Check size={14} weight="bold" />}
          </div>
        </div>

        <div className="bq-checkbox-content">
          {label && <span className="bq-checkbox-label">{label}</span>}
          {children}
        </div>
      </label>
      {error && <span className="bq-checkbox-error-msg">{error}</span>}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
          --checkbox-accent: ${BQ_COLORS.inkFaint};
        }

        .bq-checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: ${BQ_COLORS.surfaceAlt};
          border: 1.5px solid var(--checkbox-accent);
          border-radius: ${BQ_GEOMETRY.radiusMd};
          cursor: pointer;
          transition: all 0.3s ease;
          user-select: none;
        }

        .bq-checkbox-wrapper:hover {
          background: white;
          box-shadow: ${BQ_SHADOWS.soft};
          --checkbox-accent: ${BQ_COLORS.brand};
        }

        /* Sync wrapper color when checked */
        .bq-checkbox-wrapper.checked {
          --checkbox-accent: ${BQ_COLORS.brand};
          background: #fafdff; /* Light brand tint */
        }

        .bq-checkbox-wrapper.checked:hover {
           background: white;
        }

        .bq-checkbox-group.has-error { --checkbox-accent: ${BQ_COLORS.danger}; }
        .has-error .bq-checkbox-wrapper { background: #fffafb; }
        .has-error .bq-checkbox-wrapper:hover { background: white; }
        .bq-checkbox-hit-area {
          position: relative;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .bq-checkbox-input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .bq-checkbox-box {
          height: 20px;
          width: 20px;
          background-color: white;
          border: 2px solid currentColor;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: white;
        }

        .bq-checkbox-box.checked {
          background-color: var(--checkbox-accent);
          border-color: var(--checkbox-accent);
        }

        .bq-checkbox-content {
          display: flex;
          flex-direction: column;
          font-size: 14px;
          color: ${BQ_COLORS.ink};
          line-height: 1.5;
          font-weight: 500;
        }

        .bq-checkbox-label { font-weight: 600; }

        .bq-checkbox-error-msg { font-size: 12px; color: ${BQ_COLORS.danger}; font-weight: 700; padding-left: 4px; }
      `,
        }}
      />{" "}
    </div>
  );
}
