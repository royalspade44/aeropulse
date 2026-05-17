import { BQ_COLORS, BQ_FONTS, BQ_GEOMETRY, BQ_WEIGHTS } from "./BoutiqueTheme";

/**
 * BOUTIQUE CHECKBOX
 * Unified selection element for both single (radio) and multiple (checkbox) selection.
 * Features the signature "Blue Dot" visual indicator.
 */
export default function BoutiqueCheckbox({
  label,
  children,
  checked,
  onChange,
  type = "checkbox", // "checkbox" or "radio"
  ...props
}) {
  return (
    <label
      className={`bq-checkbox-container ${checked ? "active" : ""} bq-checkbox--${type}`}
    >
      <div className="bq-checkbox-wrapper">
        <input
          type={type}
          checked={checked}
          onChange={(e) => onChange(type === "radio" ? true : e.target.checked)}
          {...props}
        />
        <div className="bq-checkbox-indicator">
          <div className="bq-selection-dot" />
        </div>
      </div>
      {(children || label) && (
        <span className="bq-checkbox-text">{children || label}</span>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-checkbox-container {
          display: flex; align-items: center; gap: 14px;
          padding: 10px 16px; border-radius: ${BQ_GEOMETRY.radiusPill};
          cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1.5px solid transparent;
          user-select: none;
          width: 100%;
        }
        .bq-checkbox-container:hover { background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transform: translateX(4px); }
        .bq-checkbox-container.active { background: white; border-color: ${BQ_COLORS.accent}; }

        .bq-checkbox-wrapper { position: relative; width: 22px; height: 22px; flex-shrink: 0; }
        .bq-checkbox-wrapper input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }

        .bq-checkbox-indicator {
          position: absolute; top: 0; left: 0; height: 22px; width: 22px;
          background-color: white; border: 2.5px solid ${BQ_COLORS.border};
          border-radius: 7px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex; align-items: center; justify-content: center;
        }

        .bq-checkbox--radio .bq-checkbox-indicator { border-radius: 50%; }

        .bq-checkbox-container:hover .bq-checkbox-indicator { border-color: ${BQ_COLORS.accent}; }
        .bq-checkbox-container.active .bq-checkbox-indicator { border-color: ${BQ_COLORS.accent}; }

        .bq-selection-dot {
          width: 12px; height: 12px;
          background: ${BQ_COLORS.accent};
          border-radius: 3px;
          transform: scale(0);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }

        .bq-checkbox--radio .bq-selection-dot { border-radius: 50%; }

        .bq-checkbox-container.active .bq-selection-dot { transform: scale(1); }

        .bq-checkbox-text {
          font-family: ${BQ_FONTS.body}; font-size: 15px; font-weight: ${BQ_WEIGHTS.semibold};
          color: ${BQ_COLORS.inkMuted}; transition: color 0.3s ease;
          display: flex; align-items: center; gap: 4px;
        }
        .bq-checkbox-container.active .bq-checkbox-text { color: ${BQ_COLORS.ink}; }

        .bq-checkbox-text a { color: ${BQ_COLORS.accent}; text-decoration: none; font-weight: ${BQ_WEIGHTS.bold}; }
        .bq-checkbox-text a:hover { text-decoration: underline; }
      `,
        }}
      />
    </label>
  );
}
