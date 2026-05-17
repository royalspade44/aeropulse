import { X } from "@phosphor-icons/react";
import { BQ_COLORS, BQ_FONTS } from "./BoutiqueTheme";

/**
 * BOUTIQUE DRAWER
 * A unified sliding container for menus, carts, and other side-panels.
 */
export default function BoutiqueDrawer({
  isOpen,
  onClose,
  side = "left", // "left" or "right"
  width = "400px",
  title,
  children,
}) {
  return (
    <>
      {/* OVERLAY */}
      <div
        className={`bq-drawer-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      />

      {/* PANEL */}
      <div
        className={`bq-drawer-panel bq-drawer--${side} ${isOpen ? "active" : ""}`}
      >
        <div className="bq-drawer-header">
          {title && <h2 className="bq-drawer-title">{title}</h2>}
          <button
            className="bq-drawer-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        <div className="bq-drawer-content">{children}</div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-drawer-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4); backdrop-filter: blur(8px);
          z-index: 1500; opacity: 0; visibility: hidden;
          transition: all 0.4s ease;
        }
        .bq-drawer-overlay.active { opacity: 1; visibility: visible; }

        .bq-drawer-panel {
          position: fixed; top: 0; height: 100%;
          width: ${width}; max-width: 90vw;
          background: ${BQ_COLORS.surface};
          z-index: 2000; display: flex; flex-direction: column;
          box-shadow: ${side === "left" ? "20px" : "-20px"} 0 80px rgba(0,0,0,0.15);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .bq-drawer--left { left: calc(-1 * ${width}); }
        .bq-drawer--left.active { left: 0; }

        .bq-drawer--right { right: calc(-1 * ${width}); }
        .bq-drawer--right.active { right: 0; }

        .bq-drawer-header {
          padding: 32px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid ${BQ_COLORS.border};
          flex-shrink: 0;
        }

        .bq-drawer-title {
          font-family: ${BQ_FONTS.heading};
          font-size: 24px; font-weight: 800;
          letter-spacing: -0.02em; margin: 0;
          color: ${BQ_COLORS.ink};
        }

        .bq-drawer-close {
          background: transparent; border: none; cursor: pointer;
          color: ${BQ_COLORS.ink}; transition: transform 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .bq-drawer-close:hover { transform: rotate(90deg); }

        .bq-drawer-content {
          flex: 1; overflow-y: auto;
          display: flex; flex-direction: column;
          scrollbar-width: thin;
        }
      `,
        }}
      />
    </>
  );
}
