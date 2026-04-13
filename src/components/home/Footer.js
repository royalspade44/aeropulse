import icons from '../common/icons';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Cold Air</h4>
          <p>Professional AC installation, maintenance, and repair services in Singapore.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <p>About Us | Services | Booking | FAQ</p>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <button type="button" onClick={() => alert('Facebook')} aria-label="Facebook">
              <img src={icons.globePointer} alt="" className="inline-icon inline-icon--md" />
            </button>
            <button type="button" onClick={() => alert('Instagram')} aria-label="Instagram">
              <img src={icons.globePointer} alt="" className="inline-icon inline-icon--md" />
            </button>
            <button type="button" onClick={() => alert('Twitter')} aria-label="Twitter">
              <img src={icons.globePointer} alt="" className="inline-icon inline-icon--md" />
            </button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 Cold Air. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
