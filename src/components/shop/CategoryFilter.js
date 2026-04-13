import { useState } from 'react';
import icons from '../common/icons';

const CATEGORY_ICONS = {
  split: icons.temperatureFrigid,
  window: icons.windowFrame,
  portable: icons.boxOpen,
  inverter: icons.bolt,
  accessories: icons.tools,
  floor: icons.houseChimney,
  all: icons.boxOpen
};

function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const getCategoryIconSrc = (categoryId) => CATEGORY_ICONS[categoryId] || CATEGORY_ICONS.all;

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="category-filter">
      <div className="category-header" onClick={() => setIsExpanded(!isExpanded)} role="presentation">
        <div className="category-header-left">
          <svg
            className={`category-chevron ${isExpanded ? 'expanded' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          <h3 className="sidebar-title">Categories</h3>
        </div>
        <span className="category-total">{totalProducts} items</span>
      </div>

      {isExpanded && (
        <div className="category-content">
          <div className="category-search">
            <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="category-search-input"
            />
          </div>

          <ul className="category-list">
            <li
              className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => onSelectCategory('all')}
              role="presentation"
            >
              <div className="category-item-content">
                <span className="category-icon">
                  <img src={getCategoryIconSrc('all')} alt="" className="inline-icon" />
                </span>
                <span className="category-name">All Products</span>
              </div>
              <div className="category-right">
                <span className="category-count">{totalProducts}</span>
                {selectedCategory === 'all' && (
                  <svg className="category-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            </li>

            {filteredCategories.map(category => (
              <li
                key={category.id}
                className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => onSelectCategory(category.id)}
                role="presentation"
              >
                <div className="category-item-content">
                  <span className="category-icon">
                    <img src={getCategoryIconSrc(category.id)} alt="" className="inline-icon" />
                  </span>
                  <span className="category-name">{category.name}</span>
                </div>
                <div className="category-right">
                  <span className="category-count">{category.count}</span>
                  {selectedCategory === category.id && (
                    <svg className="category-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              </li>
            ))}

            {filteredCategories.length === 0 && (
              <li className="category-empty">
                <span>No categories found</span>
              </li>
            )}
          </ul>

          <div className="category-stats">
            <div className="stat-item">
              <span className="stat-label">Active Filter:</span>
              <span className="stat-value">
                {selectedCategory === 'all' ? 'All Categories' : categories.find(c => c.id === selectedCategory)?.name}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryFilter;
