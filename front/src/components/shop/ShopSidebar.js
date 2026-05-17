import {
  Cards,
  ComputerTower,
  DeviceMobile,
  Gear,
  Snowflake,
  SquareSplitHorizontal,
  SquaresFour,
  Wrench,
} from "@phosphor-icons/react";
import BoutiqueCheckbox from "../common/boutique/BoutiqueCheckbox";
import BoutiqueNumberInput from "../common/boutique/BoutiqueNumberInput";
import BoutiqueSearchInput from "../common/boutique/BoutiqueSearchInput";
import {
  BQ_COLORS,
  BQ_FONTS,
  BQ_GEOMETRY,
  BQ_SHADOWS,
  BQ_WEIGHTS,
} from "../common/boutique/BoutiqueTheme";

const CATEGORY_ICONS = {
  split: Cards,
  window: SquareSplitHorizontal,
  floor: ComputerTower,
  portable: DeviceMobile,
  all: SquaresFour,
  service: Wrench,
  parts: Gear,
};

export default function ShopSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  brands,
  selectedBrand,
  onSelectBrand,
  priceRange,
  onPriceChange,
  searchTerm,
  onSearchChange,
  onClearFilters,
}) {
  return (
    <aside className="bq-sidebar">
      <div className="bq-sidebar-section">
        <h2 className="bq-sidebar-title">Search</h2>
        <BoutiqueSearchInput
          placeholder="Search products..."
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>

      <div className="bq-sidebar-section">
        <h2 className="bq-sidebar-title">Categories</h2>
        <ul className="bq-cat-list">
          {categories.map((category) => {
            const IconComp = CATEGORY_ICONS[category.id] || Snowflake;
            return (
              <li
                key={category.id}
                className={`bq-cat-item ${
                  selectedCategory === category.id ? "active" : ""
                }`}
                onClick={() => onSelectCategory(category.id)}
              >
                <div className="bq-cat-content">
                  <IconComp
                    size={20}
                    weight={selectedCategory === category.id ? "fill" : "bold"}
                  />
                  <span>{category.name}</span>
                </div>
                <div className="bq-cat-right">
                  <span className="bq-cat-count">{category.count}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="bq-sidebar-section">
        <h2 className="bq-sidebar-title">Brands</h2>
        <div className="bq-brand-list">
          {brands.map((brand) => (
            <BoutiqueCheckbox
              key={brand}
              type="radio"
              label={brand === "all" ? "All Brands" : brand}
              checked={selectedBrand === brand}
              onChange={() => onSelectBrand(brand)}
            />
          ))}
        </div>
      </div>

      <div className="bq-sidebar-section">
        <h2 className="bq-sidebar-title">Price Range</h2>
        <div className="bq-price-inputs">
          <div className="bq-price-field-group">
            <span className="bq-price-field-label">Maximum</span>
            <BoutiqueNumberInput
              size="sm"
              placeholder="Max Price"
              value={priceRange.max}
              onChange={(val) => onPriceChange("max", val)}
              min={0}
              step={1000}
              width="100%"
            />
          </div>
          <div className="bq-price-field-group">
            <span className="bq-price-field-label">Minimum</span>
            <BoutiqueNumberInput
              size="sm"
              placeholder="Min Price"
              value={priceRange.min}
              onChange={(val) => onPriceChange("min", val)}
              min={0}
              step={1000}
              width="100%"
            />
          </div>
        </div>
      </div>

      <button className="bq-clear-btn" onClick={onClearFilters}>
        Clear All Filters
      </button>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-sidebar {
          width: ${BQ_GEOMETRY.sidebarWidth};
          height: calc(100vh - ${BQ_GEOMETRY.headerHeight});
          position: sticky;
          top: ${BQ_GEOMETRY.headerHeight};
          flex-shrink: 0;
          background: ${BQ_COLORS.bg};
          padding: 24px 20px;
          overflow-y: auto;
          scrollbar-width: none;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .bq-sidebar::-webkit-scrollbar { display: none; }

        .bq-sidebar-section { display: flex; flex-direction: column; }

        .bq-sidebar-title {
          font-family: ${BQ_FONTS.heading};
          font-size: 11px; font-weight: ${BQ_WEIGHTS.bold};
          color: ${BQ_COLORS.inkMuted};
          text-transform: uppercase; letter-spacing: 0.2em;
          margin-bottom: 16px;
          opacity: 0.8;
        }

        .bq-cat-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }

        .bq-cat-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px; border-radius: ${BQ_GEOMETRY.radiusPill};
          cursor: pointer; font-size: 14px; font-weight: ${BQ_WEIGHTS.bold};
          color: ${BQ_COLORS.inkMuted}; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          letter-spacing: -0.01em;
        }
        .bq-cat-item:hover { background: white; color: ${BQ_COLORS.ink}; box-shadow: ${BQ_SHADOWS.soft}; transform: translateX(4px); }
        .bq-cat-item.active { background: ${BQ_COLORS.brand}; color: white; box-shadow: ${BQ_SHADOWS.float}; font-weight: ${BQ_WEIGHTS.bold}; transform: translateX(0); }

        .bq-cat-content { display: flex; align-items: center; gap: 14px; }

        .bq-cat-count {
          font-family: ${BQ_FONTS.heading}; font-size: 10px; font-weight: ${BQ_WEIGHTS.bold};
          background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: ${BQ_GEOMETRY.radiusPill};
        }
        .bq-cat-item.active .bq-cat-count { background: rgba(255,255,255,0.2); color: white; }

        .bq-brand-list { display: flex; flex-direction: column; gap: 4px; }

        .bq-price-inputs { display: flex; flex-direction: column; gap: 16px; }
        .bq-price-field-group { display: flex; align-items: center; gap: 16px; }
        .bq-price-field-label {
            font-family: ${BQ_FONTS.heading}; font-size: 9px; font-weight: ${BQ_WEIGHTS.bold};
            color: ${BQ_COLORS.inkFaint}; text-transform: uppercase; letter-spacing: 0.1em;
            min-width: 54px;
        }

        .bq-clear-btn {
          width: 100%; padding: 16px; background: transparent;
          border: 1px solid ${BQ_COLORS.border}; border-radius: ${BQ_GEOMETRY.radiusPill};
          font-family: ${BQ_FONTS.heading}; font-weight: ${BQ_WEIGHTS.bold}; font-size: 12px;
          color: ${BQ_COLORS.inkMuted}; text-transform: uppercase; letter-spacing: 0.1em;
          cursor: pointer; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); margin-top: 16px;
        }
        .bq-clear-btn:hover { border-color: ${BQ_COLORS.ink}; color: ${BQ_COLORS.ink}; background: white; box-shadow: ${BQ_SHADOWS.soft}; transform: translateY(-2px); }
      `,
        }}
      />
    </aside>
  );
}
