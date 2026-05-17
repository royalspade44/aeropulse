import { BQ_COLORS, BQ_FONTS, BQ_GEOMETRY } from "./BoutiqueTheme";

/**
 * BOUTIQUE BUTTON
 * Unified button for Auth flows.
 * Variants: 'primary', 'ghost', 'cancel'
 */
export default function BoutiqueButton({
  children,
  variant = "primary",
  loading = false,
  fullWidth = false,
  ...props
}) {
  return (
    <button
      className={`bq-btn bq-btn--${variant} ${fullWidth ? "full-width" : ""}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Processing..." : children}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-btn {
          padding: 14px 24px;
          border-radius: ${BQ_GEOMETRY.radiusPill};
          font-family: ${BQ_FONTS.heading};
          font-weight: 800;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
          border: none;
          white-space: nowrap;
          outline: none;
        }

        .bq-btn.full-width { width: 100%; }

        .bq-btn--primary {
          background: ${BQ_COLORS.brand};
          color: white;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .bq-btn--primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.2);
        }

        .bq-btn--ghost {
          background: transparent;
          color: ${BQ_COLORS.inkMuted};
        }
        .bq-btn--ghost:hover:not(:disabled) {
          color: ${BQ_COLORS.ink};
          background: ${BQ_COLORS.bgAlt};
        }

        .bq-btn--cancel {
          background: transparent;
          color: ${BQ_COLORS.inkMuted};
        }
        .bq-btn--cancel:hover:not(:disabled) {
          color: ${BQ_COLORS.danger};
          background: none;
        }

        .bq-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `,
        }}
      />
    </button>
  );
}
