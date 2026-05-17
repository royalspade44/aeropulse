import {
  Browser,
  Lightning,
  Package,
  ShieldCheck,
  ShoppingCart,
  Snowflake,
  Star,
} from "@phosphor-icons/react";
import { useState } from "react";
import {
  BQ_COLORS,
  BQ_FONTS,
  BQ_GEOMETRY,
  BQ_SHADOWS,
} from "../common/boutique/BoutiqueTheme";

function productPlaceholderIcon(product) {
  if (product?.category === "window") return Browser;
  if (product?.category === "floor") return Package;
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
          <div className="bq-featured-badge">
            <Star size={11} weight="fill" /> Featured
          </div>
        )}

        {product.discount && (
          <div className="bq-discount-badge">{product.discount}% OFF</div>
        )}
      </div>

      <div className="bq-card-info">
        <span className="bq-brand">{product.brand}</span>
        <h3 className="bq-name">{product.name}</h3>
        <p className="bq-specs">{product.specs}</p>

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

        {product.stock > 0 ? (
          <div className="bq-stock-status">{product.stock} units available</div>
        ) : (
          <div className="bq-stock-status out">Out of Stock</div>
        )}

        <div className="bq-actions">
          <button
            className="bq-btn bq-btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={!product.inStock}
          >
            Add to Cart <ShoppingCart size={18} weight="bold" />
          </button>
          <button
            className="bq-btn bq-btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              onBuyNow(product);
            }}
            disabled={!product.inStock}
          >
            Buy Now <Lightning size={18} weight="fill" />
          </button>
        </div>

        <div className="bq-warranty">
          <ShieldCheck size={14} weight="bold" /> {product.warranty}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-card {
          flex: 1 1 340px;
          background: ${BQ_COLORS.surface};
          border-radius: ${BQ_GEOMETRY.radiusCard};
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: ${BQ_SHADOWS.soft};
          cursor: pointer;
        }

        .bq-card:hover {
          transform: translateY(-12px);
          box-shadow: ${BQ_SHADOWS.hover};
        }

        .bq-card.featured {
          box-shadow: ${BQ_SHADOWS.float}, 0 0 0 2px ${BQ_COLORS.accent};
        }

        .bq-card-image {
          height: 280px;
          background: ${BQ_COLORS.surfaceAlt};
          display: flex; align-items: center; justify-content: center;
          position: relative;
          padding: 32px;
        }

        .bq-img {
          width: 100%; height: 100%; object-fit: contain;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bq-card:hover .bq-img { transform: scale(1.1); }

        .bq-img-fallback { opacity: 0.1; color: ${BQ_COLORS.ink}; }

        .bq-featured-badge {
          position: absolute;
          top: 16px; left: 16px;
          background: ${BQ_COLORS.brand};
          color: white;
          padding: 8px 16px;
          font-family: ${BQ_FONTS.heading};
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-radius: ${BQ_GEOMETRY.radiusPill};
          z-index: 10;
          display: flex; align-items: center; gap: 6px;
        }

        .bq-discount-badge {
          position: absolute;
          top: 16px; right: 16px;
          background: ${BQ_COLORS.danger};
          color: white;
          padding: 8px 16px;
          border-radius: ${BQ_GEOMETRY.radiusPill};
          font-family: ${BQ_FONTS.heading};
          font-size: 12px;
          font-weight: 800;
        }

        .bq-card-info { padding: 32px; flex: 1; display: flex; flex-direction: column; }

        .bq-brand {
          font-family: ${BQ_FONTS.heading};
          font-size: 11px; font-weight: 800;
          color: ${BQ_COLORS.inkMuted};
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 12px;
        }

        .bq-name {
          font-family: ${BQ_FONTS.heading};
          font-size: 22px; font-weight: 700;
          color: ${BQ_COLORS.ink};
          margin-bottom: 16px;
          line-height: 1.2; letter-spacing: -0.02em;
        }

        .bq-specs { font-size: 15px; color: ${BQ_COLORS.inkMuted}; margin-bottom: 32px; }

        .bq-price-row { margin-top: auto; margin-bottom: 24px; display: flex; align-items: baseline; gap: 12px; }

        .bq-current-price {
          font-family: ${BQ_FONTS.heading};
          font-size: 32px; font-weight: 800;
          color: ${BQ_COLORS.ink};
          letter-spacing: -0.04em;
        }

        .bq-old-price {
          font-family: ${BQ_FONTS.heading};
          font-size: 18px;
          color: ${BQ_COLORS.inkFaint};
          text-decoration: line-through;
          font-weight: 500;
        }

        .bq-stock-status {
          font-family: ${BQ_FONTS.heading};
          font-size: 13px; font-weight: 800;
          color: ${BQ_COLORS.success};
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .bq-stock-status.out { color: ${BQ_COLORS.danger}; }

        .bq-actions { display: flex; flex-direction: column; gap: 12px; }

        .bq-btn {
          width: 100%; padding: 16px;
          border-radius: ${BQ_GEOMETRY.radiusPill};
          font-family: ${BQ_FONTS.heading};
          font-weight: 800; font-size: 15px;
          text-transform: uppercase; letter-spacing: 0.05em;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.3s ease; border: none;
        }

        .bq-btn-primary {
          background: ${BQ_COLORS.brand}; color: white;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .bq-btn-primary:hover:not(:disabled) {
          background: ${BQ_COLORS.brandHover}; transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.25);
        }
        .bq-btn-primary:disabled { background: ${BQ_COLORS.inkFaint}; cursor: not-allowed; opacity: 0.5; }

        .bq-btn-secondary { background: ${BQ_COLORS.surfaceAlt}; color: ${BQ_COLORS.ink}; }
        .bq-btn-secondary:hover { background: ${BQ_COLORS.inkMuted}; color: white; }

        .bq-warranty {
          font-family: ${BQ_FONTS.body};
          font-size: 13px; color: ${BQ_COLORS.inkMuted};
          margin-top: 24px; padding-top: 20px;
          border-top: 1px solid rgba(0,0,0,0.05);
          display: flex; align-items: center; gap: 8px;
          font-weight: 600;
        }
      `,
        }}
      />
    </div>
  );
}
