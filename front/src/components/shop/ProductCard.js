import {
  Cards,
  ComputerTower,
  Lightning,
  ShieldCheck,
  ShoppingCart,
  Snowflake,
  SquareSplitHorizontal,
  Star,
} from "@phosphor-icons/react";
import { useState } from "react";
import { getBrandLogo } from "../../config/brandLogos";
import BoutiqueButton from "../common/boutique/BoutiqueButton";
import BoutiqueTechnicalCard from "../common/boutique/BoutiqueTechnicalCard";
import {
  BQ_COLORS,
  BQ_FONTS,
  BQ_GEOMETRY,
  BQ_SHADOWS,
  BQ_WEIGHTS,
} from "../common/boutique/BoutiqueTheme";

function productPlaceholderIcon(product) {
  if (product?.category === "window") return SquareSplitHorizontal;
  if (product?.category === "floor") return ComputerTower;
  if (product?.category === "split") return Cards;
  return Snowflake;
}

export default function ProductCard({
  product,
  onAddToCart,
  onBuyNow,
  onClick,
}) {
  const [imgBroken, setBroken] = useState(false);
  const IconComp = productPlaceholderIcon(product);

  // Strip brand and "AC" from title
  const nameBase = product.name
    .toLowerCase()
    .startsWith(product.brand.toLowerCase())
    ? product.name.slice(product.brand.length).trim()
    : product.name;

  const displayName = nameBase.replace(/\s*AC\s*$/gi, "").trim();

  const horsepower = product.specs || product.capacity || "";
  const brandLogoUrl = getBrandLogo(product.brand);

  return (
    <div
      className={`bq-card ${product.featured ? "featured" : ""}`}
      onClick={() => onClick(product)}
    >
      <div className="bq-card-image">
        {product.imageUrl && !imgBroken ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setBroken(true)}
            className="bq-img"
          />
        ) : (
          <div className="bq-img-fallback">
            <IconComp size={64} weight="bold" />
          </div>
        )}

        {product.featured && (
          <div className="bq-card-badge-left">
            <BoutiqueTechnicalCard variant="brand" size="sm" icon={Star}>
              Featured
            </BoutiqueTechnicalCard>
          </div>
        )}

        {product.discount > 0 && (
          <div className="bq-card-badge-right">
            <BoutiqueTechnicalCard variant="danger" size="sm">
              {product.discount}% OFF
            </BoutiqueTechnicalCard>
          </div>
        )}
      </div>

      <div className="bq-card-info">
        <div className="bq-details-top">
          <div className="bq-brand-row">
            <div className="bq-brand-logo">
              <img src={brandLogoUrl} alt={product.brand} />
            </div>
            <div className="bq-title-stack">
              <span className="bq-model-label">{product.model || "MODEL"}</span>
              <div className="bq-name-group">
                <h3 className="bq-name">{displayName}</h3>
                {horsepower && (
                  <div className="bq-hp-card-wrap">
                    <BoutiqueTechnicalCard variant="blue" size="sm">
                      {horsepower}
                    </BoutiqueTechnicalCard>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bq-interactive-wrapper">
          <div className="bq-reveal-group">
            <div className="bq-price-stock-row">
              <div className="bq-price-row">
                <span className="bq-current-price">
                  ₱{product.price.toLocaleString()}
                </span>
                {product.oldPrice && (
                  <span className="bq-old-price">
                    ₱{product.oldPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <BoutiqueTechnicalCard
                variant={product.stock > 0 ? "success" : "danger"}
                size="sm"
              >
                {product.stock > 0 ? `${product.stock} Units` : "Out of Stock"}
              </BoutiqueTechnicalCard>
            </div>

            <div className="bq-buy-now-row">
              <BoutiqueButton
                variant="outline"
                size="sm"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyNow(product);
                }}
                disabled={!product.inStock}
              >
                Buy Now <Lightning size={18} weight="fill" />
              </BoutiqueButton>
            </div>
          </div>

          <div className="bq-anchor-action">
            <BoutiqueButton
              variant="primary"
              size="sm"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product, 1);
              }}
              disabled={!product.inStock}
            >
              Add to Cart <ShoppingCart size={18} weight="bold" />
            </BoutiqueButton>
          </div>
        </div>

        <div className="bq-warranty">
          <ShieldCheck size={14} weight="bold" /> {product.warranty}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-card {
          background: white;
          border-radius: ${BQ_GEOMETRY.radiusCard};
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: ${BQ_SHADOWS.soft};
          cursor: pointer;
          animation: bq-fade-in 0.6s ease;
          border: 1px solid ${BQ_COLORS.border};
          min-height: 540px;
          font-family: ${BQ_FONTS.body};
          width: 100%;
        }

        @keyframes bq-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .bq-card:hover {
          transform: translateY(-8px);
          box-shadow: ${BQ_SHADOWS.hover};
          border-color: transparent;
        }

        .bq-card-image {
          height: 220px;
          background: ${BQ_COLORS.bg};
          display: flex; align-items: center; justify-content: center;
          position: relative;
          padding: 24px;
          transition: all 0.5s ease;
        }
        .bq-card:hover .bq-card-image { background: white; }

        .bq-img {
          width: 100%; height: 100%; object-fit: contain;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bq-card:hover .bq-img { transform: scale(1.05); }

        .bq-img-fallback { opacity: 0.1; color: ${BQ_COLORS.ink}; }

        .bq-card-badge-left { position: absolute; top: 12px; left: 12px; z-index: 10; }
        .bq-card-badge-right { position: absolute; top: 12px; right: 12px; z-index: 10; }

        .bq-card-info {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .bq-details-top { margin-bottom: 20px; }

        .bq-brand-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px; }

        .bq-brand-logo {
          width: 34px; height: 34px;
          background: ${BQ_COLORS.bg};
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          padding: 5px;
          flex-shrink: 0;
          border: 1px solid ${BQ_COLORS.border};
        }
        .bq-brand-logo img { width: 100%; height: 100%; object-fit: contain; }

        .bq-title-stack { display: flex; flex-direction: column; flex: 1; }

        .bq-model-label {
          font-family: ${BQ_FONTS.heading};
          font-size: 11px; font-weight: ${BQ_WEIGHTS.bold};
          color: ${BQ_COLORS.inkMuted};
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 2px;
          display: block;
          opacity: 0.9;
        }

        .bq-name-group { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; }

        .bq-name {
          font-family: ${BQ_FONTS.heading};
          font-size: 19px; font-weight: ${BQ_WEIGHTS.bold};
          color: ${BQ_COLORS.ink};
          line-height: 1.15; letter-spacing: -0.02em;
          margin: 0;
          flex: 1;
        }

        .bq-hp-card-wrap { flex-shrink: 0; }

        .bq-interactive-wrapper {
          margin-top: auto;
          position: relative;
          height: 100px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .bq-reveal-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          transform: translateY(56px);
          position: relative;
          z-index: 1;
        }

        .bq-card:hover .bq-reveal-group {
          transform: translateY(0);
        }

        .bq-price-stock-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 44px;
            width: 100%;
        }

        .bq-price-row { display: flex; align-items: baseline; gap: 6px; }

        .bq-current-price {
          font-family: ${BQ_FONTS.heading};
          font-size: 24px; font-weight: ${BQ_WEIGHTS.bold};
          color: ${BQ_COLORS.ink};
          letter-spacing: -0.05em;
          line-height: 1;
        }

        .bq-old-price {
          font-family: ${BQ_FONTS.heading};
          font-size: 14px;
          color: ${BQ_COLORS.inkFaint};
          text-decoration: line-through;
          font-weight: ${BQ_WEIGHTS.semibold};
          line-height: 1;
        }

        .bq-anchor-action {
            margin-top: 12px;
            position: relative;
            z-index: 2;
            height: 44px;
            display: flex;
        }

        .bq-warranty {
          font-family: ${BQ_FONTS.heading};
          font-size: 11px; color: ${BQ_COLORS.inkFaint};
          margin-top: 16px; padding-top: 16px;
          border-top: 1px solid rgba(0,0,0,0.03);
          display: flex; align-items: center; gap: 6px;
          font-weight: ${BQ_WEIGHTS.semibold};
        }
      `,
        }}
      />
    </div>
  );
}
