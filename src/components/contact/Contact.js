import { useNavigate } from 'react-router-dom';
import './Contact.css';
import ContactForm from './ContactForm';
import ContactInfo from './ContactInfo';
import OfficeLocations from './OfficeLocations';
import ServicesSupport from './ServicesSupport';
import MapSection from './MapSection';
import icons from '../common/icons';
import Footer from '../home/Footer';

function Contact() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/home');
  };

  const handleConsultation = () => {
    alert('Schedule a consultation with our experts!');
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <div className="contact-header-content">
          <button className="back-btn" onClick={handleBack}>←</button>
          <h1 className="contact-title">Contact Us</h1>
        </div>
      </div>

      <div className="contact-hero">
        <h1>We're Here to Help</h1>
        <p>Have questions about our services? Need assistance with your AC? Get in touch with our friendly team.</p>
      </div>

      <div className="contact-main">
        <div className="contact-grid">
          <ContactForm />
          <ContactInfo />
        </div>

        <div className="cta-section">
          <div className="cta-content">
            <h2>Need Expert Consultation?</h2>
            <p>Let our specialists help you choose the perfect AC solution for your space. We offer free consultations and site visits.</p>
            <div className="cta-features">
              <div className="cta-feature">
                <span><img src={icons.visit} alt="" className="inline-icon" /></span>
                <span>Free Site Visit</span>
              </div>
              <div className="cta-feature">
                <span><img src={icons.cartShoppingFast} alt="" className="inline-icon" /></span>
                <span>Best Price Guarantee</span>
              </div>
              <div className="cta-feature">
                <span><img src={icons.tools} alt="" className="inline-icon" /></span>
                <span>Expert Technicians</span>
              </div>
            </div>
          </div>
          <div>
            <button className="cta-btn" onClick={handleConsultation}>
              Request Consultation →
            </button>
          </div>
        </div>

        <div className="locations-services-grid">
          <OfficeLocations />
          <ServicesSupport />
        </div>

        <MapSection />

      </div>
      <Footer />
    </div>
  );
}

export default Contact;