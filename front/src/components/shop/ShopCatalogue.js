import { WarningDiamond } from "@phosphor-icons/react";
import BoutiqueSelect from "../common/boutique/BoutiqueSelect";
import {
  BQ_COLORS,
  BQ_FONTS,
  BQ_GEOMETRY,
  BQ_WEIGHTS,
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
  const sortOptions = [
    { value: "default", label: "Sort by: Default" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "hp_asc", label: "Horsepower: Low to High" },
    { value: "hp_desc", label: "Horsepower: High to Low" },
    { value: "name_asc", label: "Name: A to Z" },
  ];

  return (
    <section className="bq-catalogue">
      <div className="bq-scrollview">
        <div className="bq-catalogue-header">
          <div className="bq-results-count">
            Found {products.length} products
          </div>
          <BoutiqueSelect
            options={sortOptions}
            value={sortBy}
            onChange={onSortChange}
          />
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
          background: white;
        }

        .bq-scrollview {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
          scrollbar-width: none;
          border-left: 1px solid ${BQ_COLORS.border};
        }
        .bq-scrollview::-webkit-scrollbar { display: none; }

        .bq-catalogue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          position: sticky;
          top: -32px;
          background: white;
          z-index: 100;
          padding: 24px 0 12px;
          margin-top: -32px;
          border-bottom: 1px solid rgba(0,0,0,0.03);
        }

        .bq-results-count {
          font-family: ${BQ_FONTS.heading};
          font-size: 14px; font-weight: ${BQ_WEIGHTS.bold};
          color: ${BQ_COLORS.inkMuted};
          letter-spacing: 0.05em;
          text-transform: uppercase;
          opacity: 0.6;
        }

        .bq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .bq-empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 100px 20px; color: ${BQ_COLORS.inkFaint};
        }
        .bq-empty-state p {
          font-family: ${BQ_FONTS.heading}; font-weight: ${BQ_WEIGHTS.bold}; font-size: 18px; margin-top: 16px;
        }
      `,
        }}
      />
    </section>
  );
}
