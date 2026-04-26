import icons from '../common/icons';
import coldAirLogo from '../common/images/Cold Air Logo.jpg';

function RegisterBrandSection() {
  const features = [
    { icon: icons.checkCircle, text: 'Join thousands of satisfied customers' },
    { icon: icons.cartShoppingFast, text: 'Get exclusive member discounts' },
    { icon: icons.bolt, text: 'Fast checkout and order tracking' },
    { icon: icons.envelope, text: '24/7 priority customer support' }
  ];

  return (
    <div className="register-brand">
      <div className="brand-content">
        <div className="brand-logo">
          <img src={coldAirLogo} alt="Cold Air logo" />
        </div>
        <h1 className="brand-name">COLD AIR</h1>
        <p className="brand-tagline">AIRCONDITIONING TRADING</p>
        <div className="brand-features">
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <span className="feature-icon">
                <img src={feature.icon} alt="" className="inline-icon inline-icon--md" />
              </span>
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RegisterBrandSection;
