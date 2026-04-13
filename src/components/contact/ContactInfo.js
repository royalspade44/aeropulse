import icons from '../common/icons';

function ContactInfo() {
  const contactItems = [
    { iconSrc: icons.phoneCall, title: 'Phone Number', details: ['+65 6760 0083', '+65 9123 4567'] },
    { iconSrc: icons.envelope, title: 'Email Address', details: ['info@coldair.com.sg', 'support@coldair.com.sg'] },
    { iconSrc: icons.globePointer, title: 'Website', details: ['www.coldair.com.sg'] },
    { iconSrc: icons.marker, title: 'Address', details: ['192 Pandan Loop #06-29', 'Singapore 128381'] }
  ];

  return (
    <div className="info-section">
      <h2>Contact Information</h2>
      <p>Reach out to us through any of these channels. Our team is ready to assist you.</p>
      <div className="contact-details">
        {contactItems.map((item, index) => (
          <div key={index} className="contact-item">
            <div className="contact-icon">
              <img src={item.iconSrc} alt="" className="inline-icon inline-icon--lg" />
            </div>
            <div className="contact-text">
              <h4>{item.title}</h4>
              {item.details.map((detail, i) => (
                <p key={i}>{detail}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactInfo;
