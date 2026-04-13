import icons from '../common/icons';

function InfoSection() {
  return (
    <div className="info-section">
      <div className="info-card">
        <h3>
          <img src={icons.clipboardList} alt="" className="inline-icon inline-icon--md" /> Opening Hours
        </h3>
        <ul className="hours-list">
          <li><span>Monday - Friday</span><span>9:00am - 5:30pm</span></li>
          <li><span>Saturday</span><span>9:00am - 3:30pm</span></li>
          <li><span>Sunday & Public Holiday</span><span>Off</span></li>
        </ul>
      </div>
      <div className="info-card">
        <h3>
          <img src={icons.marker} alt="" className="inline-icon inline-icon--md" /> Contact Us
        </h3>
        <ul className="contact-info">
          <li><span><img src={icons.marker} alt="" className="inline-icon" /></span><span>192 Pandan Loop #06-29, Singapore 128381</span></li>
          <li><span><img src={icons.phoneCall} alt="" className="inline-icon" /></span><span>+65 6760 0083</span></li>
          <li><span><img src={icons.envelope} alt="" className="inline-icon" /></span><span>wondercoolac@gmail.com</span></li>
        </ul>
      </div>
    </div>
  );
}

export default InfoSection;
