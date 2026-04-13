import icons from '../common/icons';

function ServicesSupport() {
  const services = [
    { icon: icons.temperatureFrigid, name: 'AC Installation' },
    { icon: icons.tools, name: 'Repair Services' },
    { icon: icons.broom, name: 'Regular Maintenance' },
    { icon: icons.diamondExclamation, name: 'Chemical Cleaning' },
    { icon: icons.wind, name: 'Gas Top-up' },
    { icon: icons.clipboardList, name: 'Consultation' }
  ];

  const support = [
    { title: 'Sales', phone: '+65 6760 0083', email: 'sales@coldair.com.sg', icon: icons.cartShoppingFast },
    { title: 'Customer Service', phone: '+65 9123 4567', email: 'support@coldair.com.sg', icon: icons.memberList },
    { title: 'Technical Support', phone: '+65 8888 9999', email: 'tech@coldair.com.sg', icon: icons.tools }
  ];

  return (
    <>
      <div className="services-section">
        <h3>Our Services</h3>
        <div className="services-list">
          {services.map((service, index) => (
            <div key={index} className="service-item">
              <span>
                <img src={service.icon} alt="" className="inline-icon inline-icon--md" />
              </span>
              <span>{service.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="support-section">
        <h3>Support Teams</h3>
        <div className="support-grid">
          {support.map((item, index) => (
            <div key={index} className="support-card">
              <div className="support-icon">
                <img src={item.icon} alt="" className="inline-icon inline-icon--lg" />
              </div>
              <h4>{item.title}</h4>
              <p>{item.phone}</p>
              <p style={{ fontSize: '12px' }}>{item.email}</p>
              <a href={`mailto:${item.email}`} className="support-link">Contact →</a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default ServicesSupport;
