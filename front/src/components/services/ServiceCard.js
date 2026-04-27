import icons from '../common/icons';

function ServiceCard({ service, onBook }) {
  return (
    <div className="service-card">
      <div className="service-card-image">
        <span className="service-icon">
          <img src={service.iconSrc} alt="" className="inline-icon inline-icon--xl" />
        </span>
        {service.popular && <div className="service-badge">Popular</div>}
      </div>
      <div className="service-card-content">
        <h3 className="service-name">{service.name}</h3>
        <p className="service-description">{service.description}</p>
        <div className="service-details">
          <span className="service-detail">Duration: {service.duration}</span>
          <span className="service-detail">
            <img src={icons.memberList} alt="" className="inline-icon" /> {service.technicians} technicians
          </span>
        </div>
        <div className="service-price">
          {'\u20b1'}{service.price.toLocaleString()}
          <small> / service</small>
        </div>
        <button type="button" className="book-btn" onClick={() => onBook(service)}>
          Book Now →
        </button>
      </div>
    </div>
  );
}

export default ServiceCard;
