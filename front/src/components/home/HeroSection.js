function HeroSection({ onBookNow, onShop }) {
  return (
    <section className="hero-section">
      <div className="hero-inner">
        <div className="hero-content">
          <span className="hero-badge">FRESH & COMFORT</span>
          <h1 className="hero-title">Stay Cool All Summer</h1>
          <p className="hero-subtitle">Professional AC installation, maintenance, and repair services</p>
          <div className="hero-actions">
            <button type="button" className="hero-btn" onClick={onBookNow}>BOOK NOW →</button>
            <button type="button" className="hero-btn hero-btn--secondary" onClick={onShop}>VIEW PRODUCTS</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;