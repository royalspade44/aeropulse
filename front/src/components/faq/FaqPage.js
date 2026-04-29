import { useNavigate } from 'react-router-dom';
import Footer from '../home/Footer';
import icons from '../common/icons';
import './FaqPage.css';

const FAQ_ITEMS = [
  {
    question: 'How long does AC delivery take after ordering?',
    answer: 'Most in-stock units are scheduled within 24 to 48 hours after payment verification and branch allocation.'
  },
  {
    question: 'Can I reschedule my installation appointment?',
    answer: 'Yes. Open your service booking details at least 12 hours before the appointment and choose a new slot.'
  },
  {
    question: 'Do you provide warranty service for all brands?',
    answer: 'Yes. Warranty coverage depends on the unit brand and model, and is visible in your unit details page.'
  },
  {
    question: 'What payment methods are supported?',
    answer: 'You can pay by COD, GCash, card, or pay-on-installation depending on your order type and branch policy.'
  }
];

function FaqPage() {
  const navigate = useNavigate();

  return (
    <div className="faq-page">
      <div className="faq-header">
        <div className="faq-header-content">
          <button type="button" className="back-btn" onClick={() => navigate('/home')}>←</button>
          <h1>Frequently Asked Questions</h1>
        </div>
      </div>

      <main className="faq-main">
        <p className="faq-intro">
          Find quick answers about ordering, service appointments, payments, and warranty support.
        </p>
        <div className="faq-list">
          {FAQ_ITEMS.map((item) => (
            <article key={item.question} className="faq-item">
              <h3><img src={icons.clipboardList} alt="" className="inline-icon" /> {item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default FaqPage;
