function HeroSection({ onBookNow }) {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <span className="hero-badge">FRESH & COMFORT</span>
        <h1 className="hero-title">Stay Cool All Summer</h1>
        <p className="hero-subtitle">Professional AC installation, maintenance, and repair services</p>
        <button className="hero-btn" onClick={onBookNow}>BOOK NOW →</button>
      </div>
    </div>
  );
}

export default HeroSection;