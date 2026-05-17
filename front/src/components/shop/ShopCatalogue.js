import { WarningDiamond } from "@phosphor-icons/react";
import {
  BQ_COLORS,
  BQ_FONTS,
  BQ_GEOMETRY,
  BQ_SHADOWS,
} from "../common/boutique/BoutiqueTheme";
import ProductCard from "./ProductCard";

export default function ShopCatalogue({
  products,
  onAddToCart,
  onBuyNow,
  onProductClick,
  sortBy,
  onSortChange,
}) {
  return (
    <section className="bq-catalogue">
      <div className="bq-scrollview">
        <div className="bq-catalogue-header">
          <div className="bq-results-count">
            Found {products.length} products
          </div>
          <select
            className="bq-sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="default">Sort by: Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="discount_desc">Biggest Discount</option>
          </select>
        </div>

        {products.length === 0 ? (
          <div className="bq-empty-state">
            <WarningDiamond size={64} weight="bold" />
            <p>No products found matching your filters.</p>
          </div>
        ) : (
          <div className="bq-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                onClick={onProductClick}
              />
            ))}
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-catalogue {
          flex: 1;
          height: calc(100vh - ${BQ_GEOMETRY.headerHeight});
          position: sticky;
          top: ${BQ_GEOMETRY.headerHeight};
          display: flex;
          flex-direction: column;
          background: ${BQ_COLORS.bg};
        }

        .bq-scrollview {
          flex: 1;
          overflow-y: auto;
          padding: 40px 60px;
          scrollbar-width: none;
          border-left: 1px solid rgba(0,0,0,0.05);
          border-right: 1px solid rgba(0,0,0,0.05);
        }
        .bq-scrollview::-webkit-scrollbar { display: none; }

        .bq-catalogue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 48px;
        }

        .bq-results-count {
          font-family: ${BQ_FONTS.heading};
          font-size: 16px; font-weight: 600;
          color: ${BQ_COLORS.inkMuted};
        }

        .bq-sort-select {
          padding: 12px 24px;
          border-radius: ${BQ_GEOMETRY.radiusPill};
          border: none;
          font-family: ${BQ_FONTS.body};
          font-size: 15px; font-weight: 600;
          background: ${BQ_COLORS.surface};
          box-shadow: ${BQ_SHADOWS.soft};
          cursor: pointer; transition: all 0.3s;
          outline: none;
        }
        .bq-sort-select:hover { box-shadow: ${BQ_SHADOWS.float}; transform: translateY(-2px); }

        .bq-grid {
          display: flex; flex-wrap: wrap; gap: 40px;
        }

        .bq-empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 100px 20px; color: ${BQ_COLORS.inkFaint};
        }
        .bq-empty-state p {
          font-family: ${BQ_FONTS.heading}; font-weight: 700; font-size: 18px; margin-top: 16px;
        }
      `,
        }}
      />
    </section>
  );
}
