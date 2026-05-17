import { BQ_COLORS, BQ_FONTS, BQ_GEOMETRY, BQ_SHADOWS } from '../common/boutique/BoutiqueTheme';

export default function HomeBrands({ brands }) {
  return (
    <section className="home-brands">
      <div className="brands-container">
        <h2 className="brands-title">Our Partners</h2>
        <div className="brands-grid">
          {brands.map(brand => (
            <div key={brand.id} className="brand-card">
              <div className="brand-logo-wrap">
                <img src={brand.logoUrl} alt={brand.name} />
              </div>
              <div className="brand-info">
                <span className="brand-name">{brand.name}</span>
                <span className="brand-desc">{brand.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .home-brands {
          padding: 100px 40px;
          background: ${BQ_COLORS.surface};
        }

        .brands-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .brands-title {
          font-family: ${BQ_FONTS.heading};
          font-size: 14px;
          font-weight: 800;
          color: ${BQ_COLORS.inkMuted};
          text-transform: uppercase;
          letter-spacing: 0.2em;
          text-align: center;
          margin-bottom: 64px;
        }

        .brands-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
        }

        .brand-card {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 24px;
          background: ${BQ_COLORS.bg};
          border-radius: ${BQ_GEOMETRY.radiusCard};
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .brand-card:hover {
          transform: translateY(-8px);
          background: white;
          box-shadow: ${BQ_SHADOWS.float};
        }

        .brand-logo-wrap {
          width: 80px; height: 80px;
          background: white;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          padding: 12px;
          flex-shrink: 0;
          box-shadow: ${BQ_SHADOWS.soft};
        }
        .brand-logo-wrap img { width: 100%; height: 100%; object-fit: contain; }

        .brand-info { display: flex; flex-direction: column; }
        .brand-name { font-family: ${BQ_FONTS.heading}; font-size: 18px; font-weight: 800; color: ${BQ_COLORS.ink}; }
        .brand-desc { font-size: 13px; color: ${BQ_COLORS.inkMuted}; margin-top: 2px; }

        @media (max-width: 768px) {
          .brands-grid { grid-template-columns: 1fr; }
        }
      ` }} />
    </section>
  );
}
