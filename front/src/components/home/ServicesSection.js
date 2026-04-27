function ServicesSection({ services, onAddToCart }) {
  return (
    <div className="services-section">
      <div className="section-header">
        <h2 className="section-title">Our Services</h2>
        <button className="see-all" style={{ background: 'none', border: 'none', color: '#1E88E5', cursor: 'pointer' }}>
          View All →
        </button>
      </div>
      <div className="services-grid">
        {services.map(service => (
          <div key={service.name} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <p style={{ color: '#1E88E5', fontWeight: 'bold' }}>₱{service.price}</p>
            <button className="service-btn" onClick={() => onAddToCart(service)}>
              Add to Cart →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServicesSection;