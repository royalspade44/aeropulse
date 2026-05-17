import { Headphones, ShieldCheck, Truck } from "@phosphor-icons/react";
import { BQ_COLORS, BQ_FONTS, BQ_SHADOWS } from '../common/boutique/BoutiqueTheme';

export default function HomeInfo() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Certified Service",
      desc: "Manufacturer-approved maintenance and installation experts."
    },
    {
      icon: Truck,
      title: "Precision Delivery",
      desc: "Next-day shipping on all in-stock boutique AC units."
    },
    {
      icon: Headphones,
      title: "Direct Support",
      desc: "24/7 dedicated line for our premium account holders."
    }
  ];

  return (
    <section className="home-info">
      <div className="info-container">
        <div className="info-main">
          <h2 className="info-title">Why AeroPulse?</h2>
          <p className="info-text">
            We don't just sell air conditioners; we curate comfort environments.
            Our boutique approach ensures that every unit is paired with precision
            engineering and world-class support.
          </p>
          <div className="info-features">
            {features.map((f, i) => (
              <div key={i} className="feat-item">
                <div className="feat-icon"><f.icon size={24} weight="fill" /></div>
                <div className="feat-content">
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="info-visual">
          {/* A high-end floating stat block */}
          <div className="stat-blob">
            <span className="stat-num">99.8%</span>
            <span className="stat-label">Client Satisfaction</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .home-info {
          padding: 120px 40px;
          background: ${BQ_COLORS.bgAlt};
        }

        .info-container {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 100px;
          align-items: center;
        }

        .info-title {
          font-family: ${BQ_FONTS.heading};
          font-size: 48px; font-weight: 900;
          color: ${BQ_COLORS.ink}; letter-spacing: -0.04em;
          margin-bottom: 24px;
        }

        .info-text {
          font-size: 18px; color: ${BQ_COLORS.inkMuted};
          line-height: 1.6; margin-bottom: 64px;
        }

        .info-features { display: flex; flex-direction: column; gap: 40px; }

        .feat-item { display: flex; gap: 24px; }
        .feat-icon {
          width: 56px; height: 56px; background: ${BQ_COLORS.brand}; color: white;
          border-radius: 16px; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .feat-content h4 {
          font-family: ${BQ_FONTS.heading}; font-size: 20px; font-weight: 800;
          color: ${BQ_COLORS.ink}; margin-bottom: 4px;
        }
        .feat-content p { font-size: 15px; color: ${BQ_COLORS.inkMuted}; line-height: 1.5; }

        .info-visual { display: flex; justify-content: center; }

        .stat-blob {
          width: 320px; height: 320px; background: white;
          border-radius: 64px; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          box-shadow: ${BQ_SHADOWS.float};
          transform: rotate(-3deg);
        }

        .stat-num { font-family: ${BQ_FONTS.heading}; font-size: 72px; font-weight: 950; color: ${BQ_COLORS.brand}; letter-spacing: -0.05em; }
        .stat-label { font-family: ${BQ_FONTS.heading}; font-size: 14px; font-weight: 800; color: ${BQ_COLORS.inkMuted}; text-transform: uppercase; letter-spacing: 0.1em; }

        @media (max-width: 1024px) {
          .info-container { grid-template-columns: 1fr; gap: 64px; }
          .info-visual { display: none; }
        }
      ` }} />
    </section>
  );
}
