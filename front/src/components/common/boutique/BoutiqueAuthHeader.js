import { BQ_COLORS, BQ_FONTS } from "./BoutiqueTheme";

/**
 * BOUTIQUE AUTH HEADER
 * Standard header block for titles and subtitles within Auth flows.
 */
export default function BoutiqueAuthHeader({ title, subtitle, children }) {
  return (
    <div className="bq-auth-header-block bq-fade-in">
      <div className="bq-auth-header-top">
        <h2>{title}</h2>
        <div className="bq-auth-header-extra">{children}</div>
      </div>
      {subtitle && <p className="bq-auth-subtitle">{subtitle}</p>}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-auth-header-block {
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .bq-auth-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .bq-auth-header-block h2 {
          font-family: ${BQ_FONTS.heading};
          font-size: 32px;
          font-weight: 900;
          color: ${BQ_COLORS.ink};
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .bq-auth-subtitle {
          font-size: 15px;
          color: ${BQ_COLORS.inkMuted};
          margin: 0;
          font-weight: 500;
          opacity: 0.8;
          max-width: 400px;
          line-height: 1.5;
        }

        .bq-auth-header-extra {
          display: flex;
          align-items: center;
        }

        @media (max-width: 640px) {
          .bq-auth-header-top { flex-direction: column; align-items: flex-start; gap: 12px; }
          .bq-auth-header-block h2 { font-size: 28px; }
        }
      `,
        }}
      />
    </div>
  );
}
