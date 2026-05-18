import RegisterBrandSection from "../../register/RegisterBrandSection";
import { BQ_COLORS } from "./BoutiqueTheme";

/**
 * BOUTIQUE AUTH LAYOUT
 * Unified layout for Login and Registration.
 * Handles the 50/50 flex split and mobile vertical stacking.
 */
export default function BoutiqueAuthLayout({ children }) {
  return (
    <div className="bq-auth-layout">
      <div className="bq-auth-flex">
        {/* BRAND PANEL AREA */}
        <div className="bq-auth-brand-area">
          <RegisterBrandSection />
        </div>

        {/* FORM PANEL AREA */}
        <div className="bq-auth-form-area">
          <div className="bq-auth-form-constraint">{children}</div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* GLOBAL AUTH KEYFRAMES */
        @keyframes bq-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .bq-auth-layout {
          min-height: 100vh;
          background: white;
          display: flex;
          width: 100%;
          overflow-x: hidden;
        }

        .bq-auth-flex {
          display: flex;
          width: 100%;
          min-height: 100vh;
          flex-direction: row; /* Force horizontal on landscape */
        }

        /* 50/50 Flex Partitioning */
        .bq-auth-brand-area {
          flex: 1;
          min-width: 0;
          background: ${BQ_COLORS.brand};
          display: flex;
          flex-direction: column;
        }

        .bq-auth-form-area {
          flex: 1;
          min-width: 0;
          background: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0;
          overflow-y: auto;
          position: relative;
        }

        /* The real container that keeps inputs at a readable width */
        .bq-auth-form-constraint {
          width: 100%;
          height: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          padding: 60px 20px;
          animation: fadeIn 0.6s ease;
        }

        .bq-spin { animation: bq-spin 1s linear infinite; }
        .bq-fade-in { animation: fadeIn 0.4s ease; }
        .bq-slide-down { animation: slideDown 0.3s ease; }

        /* RESPONSIVE STACKING */
        @media (max-width: 1024px) {
          .bq-auth-flex { flex-direction: column; }
          .bq-auth-brand-area { flex: none; height: fit-content; }
          .bq-auth-form-area { flex: none; min-height: 60vh; padding: 32px 24px; }
        }
      `,
        }}
      />
    </div>
  );
}
