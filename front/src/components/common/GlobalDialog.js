import { Info, WarningDiamond } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import {
  BQ_COLORS,
  BQ_FONTS,
  BQ_GEOMETRY,
  BQ_SHADOWS,
} from "./boutique/BoutiqueTheme";

function GlobalDialog() {
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message) => {
      window.dispatchEvent(
        new CustomEvent("app:dialog", {
          detail: {
            type: "alert",
            title: "Notice",
            message: String(message || ""),
          },
        }),
      );
    };

    const handleDialogEvent = (event) => {
      setDialog(event.detail);
    };

    window.addEventListener("app:dialog", handleDialogEvent);

    return () => {
      window.alert = originalAlert;
      window.removeEventListener("app:dialog", handleDialogEvent);
    };
  }, []);

  if (!dialog) return null;

  const closeAlert = () => {
    setDialog(null);
  };

  const resolveConfirm = (value) => {
    if (typeof dialog.resolve === "function") dialog.resolve(value);
    setDialog(null);
  };

  const isConfirm = dialog.type === "confirm";

  return (
    <>
      <div
        className="bq-dialog-overlay"
        onClick={() => (isConfirm ? resolveConfirm(false) : closeAlert())}
      />
      <div className="bq-dialog">
        <div className="bq-dialog-icon">
          {isConfirm ? (
            <WarningDiamond
              size={48}
              weight="duotone"
              color={BQ_COLORS.warning}
            />
          ) : (
            <Info size={48} weight="duotone" color={BQ_COLORS.brand} />
          )}
        </div>
        <h3 className="bq-dialog-title">
          {dialog.title || (isConfirm ? "Please Confirm" : "Notice")}
        </h3>
        <p className="bq-dialog-msg">{dialog.message}</p>

        <div className="bq-dialog-actions">
          {isConfirm ? (
            <>
              <button
                type="button"
                className="bq-dialog-btn bq-dialog-btn--ghost"
                onClick={() => resolveConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bq-dialog-btn bq-dialog-btn--primary"
                onClick={() => resolveConfirm(true)}
              >
                Confirm
              </button>
            </>
          ) : (
            <button
              type="button"
              className="bq-dialog-btn bq-dialog-btn--primary"
              onClick={closeAlert}
            >
              Dismiss
            </button>
          )}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-dialog-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px);
          z-index: 4000; animation: fadeIn 0.3s ease;
        }

        .bq-dialog {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 100%; max-width: 400px; background: white; border-radius: ${BQ_GEOMETRY.radiusCard};
          padding: 40px; z-index: 4001; display: flex; flex-direction: column; align-items: center;
          text-align: center; box-shadow: ${BQ_SHADOWS.float}; animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .bq-dialog-icon { margin-bottom: 24px; }

        .bq-dialog-title {
          font-family: ${BQ_FONTS.heading}; font-size: 24px; font-weight: 800;
          color: ${BQ_COLORS.ink}; margin: 0 0 12px;
        }

        .bq-dialog-msg { font-size: 16px; color: ${BQ_COLORS.inkMuted}; line-height: 1.5; margin: 0 0 32px; }

        .bq-dialog-actions { display: flex; gap: 12px; width: 100%; }

        .bq-dialog-btn {
          flex: 1; padding: 14px; border-radius: ${BQ_GEOMETRY.radiusPill};
          font-family: ${BQ_FONTS.heading}; font-weight: 800; font-size: 14px;
          text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer;
          transition: all 0.3s; border: none;
        }

        .bq-dialog-btn--primary { background: ${BQ_COLORS.brand}; color: white; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .bq-dialog-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(0,0,0,0.2); }

        .bq-dialog-btn--ghost { background: transparent; color: ${BQ_COLORS.inkMuted}; }
        .bq-dialog-btn--ghost:hover { background: ${BQ_COLORS.bgAlt}; color: ${BQ_COLORS.ink}; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, -40%); } to { opacity: 1; transform: translate(-50%, -50%); } }
      `,
        }}
      />
    </>
  );
}

export default GlobalDialog;
