import {
  Browser,
  DeviceMobile,
  Lightning,
  MagnifyingGlass,
  Package,
  Snowflake,
  SquaresFour,
  Wrench,
} from "@phosphor-icons/react";
import { useState } from "react";
import {
  BQ_COLORS,
  BQ_FONTS,
  BQ_GEOMETRY,
  BQ_SHADOWS,
} from "../common/boutique/BoutiqueTheme";

const CATEGORY_ICONS = {
  split: Snowflake,
  window: Browser,
  portable: DeviceMobile,
  inverter: Lightning,
  accessories: Wrench,
  floor: Package,
  all: SquaresFour,
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
  const [catSearch, setCatSearch] = useState("");

  const filteredCats = categories.filter((c) =>
    c.name.toLowerCase().includes(catSearch.toLowerCase()),
  );

  return (
    <aside className="bq-sidebar">
      {/* Categories Section */}
      <div className="bq-sidebar-section">
        <h3 className="bq-sidebar-title">Categories</h3>
        <div className="bq-sidebar-search-wrap">
          <MagnifyingGlass size={18} weight="bold" className="bq-search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            className="bq-sidebar-input"
          />
        </div>
        <ul className="bq-cat-list">
          {filteredCats.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || CATEGORY_ICONS.all;
            const active = selectedCategory === cat.id;
            return (
              <li
                key={cat.id}
                className={`bq-cat-item ${active ? "active" : ""}`}
                onClick={() => onSelectCategory(cat.id)}
              >
                <div className="bq-cat-content">
                  <Icon size={20} weight={active ? "fill" : "bold"} />
                  <span>{cat.name}</span>
                </div>
                <span className="bq-cat-count">{cat.count}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Brands Section */}
      <div className="bq-sidebar-section">
        <h3 className="bq-sidebar-title">Brands</h3>
        <div className="bq-brand-list">
          {brands.map((brand) => (
            <label key={brand} className="bq-brand-label">
              <input
                type="radio"
                name="brand"
                checked={selectedBrand === brand}
                onChange={() => onSelectBrand(brand)}
              />
              <span>{brand === "all" ? "All Brands" : brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Section */}
      <div className="bq-sidebar-section">
        <h3 className="bq-sidebar-title">Price Range</h3>
        <div className="bq-price-inputs">
          <input
            type="number"
            className="bq-sidebar-input"
            value={priceRange.min}
            onChange={(e) => onPriceChange("min", e.target.value)}
          />
          <span className="bq-price-dash">—</span>
          <input
            type="number"
            className="bq-sidebar-input"
            value={priceRange.max}
            onChange={(e) => onPriceChange("max", e.target.value)}
          />
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
          padding: 40px 32px;
          overflow-y: auto;
          scrollbar-width: none;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }
        .bq-sidebar::-webkit-scrollbar { display: none; }

        .bq-sidebar-section { display: flex; flex-direction: column; }

        .bq-sidebar-title {
          font-family: ${BQ_FONTS.heading};
          font-size: 12px; font-weight: 800;
          color: ${BQ_COLORS.inkMuted};
          text-transform: uppercase; letter-spacing: 0.15em;
          margin-bottom: 20px;
        }

        .bq-sidebar-search-wrap { position: relative; margin-bottom: 24px; }
        .bq-search-icon {
          position: absolute; left: 18px; top: 50%;
          transform: translateY(-50%); color: ${BQ_COLORS.inkFaint};
        }

        .bq-sidebar-input {
          width: 100%; padding: 16px 20px; padding-left: 48px;
          background: ${BQ_COLORS.surface}; border: none;
          border-radius: ${BQ_GEOMETRY.radiusPill};
          font-size: 15px; color: ${BQ_COLORS.ink};
          box-shadow: ${BQ_SHADOWS.soft}; transition: all 0.3s ease;
        }
        .bq-sidebar-input:focus {
          outline: none; box-shadow: ${BQ_SHADOWS.float}; transform: translateY(-2px);
        }

        .bq-cat-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }

        .bq-cat-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px; border-radius: ${BQ_GEOMETRY.radiusPill};
          cursor: pointer; font-size: 15px; font-weight: 600;
          color: ${BQ_COLORS.inkMuted}; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bq-cat-item:hover { background: ${BQ_COLORS.surface}; color: ${BQ_COLORS.ink}; box-shadow: ${BQ_SHADOWS.soft}; }
        .bq-cat-item.active { background: ${BQ_COLORS.brand}; color: white; box-shadow: ${BQ_SHADOWS.float}; }

        .bq-cat-count {
          font-family: ${BQ_FONTS.heading}; font-size: 11px; font-weight: 800;
          background: rgba(0,0,0,0.05); padding: 4px 10px; border-radius: ${BQ_GEOMETRY.radiusPill};
        }
        .bq-cat-item.active .bq-cat-count { background: rgba(255,255,255,0.2); color: white; }

        .bq-brand-list { display: flex; flex-direction: column; gap: 12px; }
        .bq-brand-label {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 16px; border-radius: ${BQ_GEOMETRY.radiusPill};
          cursor: pointer; font-size: 15px; font-weight: 500;
          color: ${BQ_COLORS.inkMuted}; transition: all 0.3s;
        }
        .bq-brand-label:hover { background: ${BQ_COLORS.surface}; color: ${BQ_COLORS.ink}; box-shadow: ${BQ_SHADOWS.soft}; }
        .bq-brand-label input { width: 18px; height: 18px; accent-color: ${BQ_COLORS.brand}; }

        .bq-price-inputs { display: flex; align-items: center; gap: 12px; }
        .bq-price-dash { color: ${BQ_COLORS.inkFaint}; font-weight: 800; }
        .bq-price-inputs .bq-sidebar-input { padding-left: 20px; text-align: center; }

        .bq-clear-btn {
          width: 100%; padding: 16px; background: transparent;
          border: 2px solid ${BQ_COLORS.inkFaint}; border-radius: ${BQ_GEOMETRY.radiusPill};
          font-family: ${BQ_FONTS.heading}; font-weight: 800; font-size: 14px;
          color: ${BQ_COLORS.inkMuted}; text-transform: uppercase; letter-spacing: 0.05em;
          cursor: pointer; transition: all 0.3s ease; margin-top: auto;
        }
        .bq-clear-btn:hover { border-color: ${BQ_COLORS.ink}; color: ${BQ_COLORS.ink}; }
      `,
        }}
      />
    </aside>
  );
}
