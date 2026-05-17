// import icons from '../common/icons';
const icons = {}; // BOUTIQUE MIGRATION STUB

function ContactInfo() {
  const contactItems = [
    {
      iconSrc: icons.phoneCall,
      title: "Phone Number",
      details: ["09086854532"],
    },
    {
      iconSrc: icons.envelope,
      title: "Email Address",
      details: ["coldairairconditionaing@yahoo.com"],
    },
    {
      iconSrc: icons.clipboardList,
      title: "Office Hours",
      details: [
        "8:00am - 5:00pm (Monday - Friday)",
        "Operations: Monday - Sunday (Online & Technician Tasks)",
      ],
    },
    {
      iconSrc: icons.marker,
      title: "Address",
      details: ["192 Pandan Loop #06-29", "Singapore 128381"],
    },
  ];

  return (
    <div className="info-section">
      <h2>Contact Information</h2>
      <p>
        Reach out to us through any of these channels. Our team is ready to
        assist you.
      </p>
      <div className="contact-details">
        {contactItems.map((item, index) => (
          <div key={index} className="contact-item">
            <div className="contact-icon">
              <img
                src={item.iconSrc}
                alt=""
                className="inline-icon inline-icon--lg"
              />
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
