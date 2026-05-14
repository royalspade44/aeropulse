import icons from '../common/icons';
import coldAirLogo from '../common/images/Cold Air Logo.jpg';

function LoginBrandSection() {
  const features = [
    { icon: icons.temperatureFrigid, text: 'Premium Quality AC Units' },
    { icon: icons.tools, text: 'Expert Installation Service' },
    { icon: icons.checkCircle, text: '24/7 Customer Support' },
    { icon: icons.cartShoppingFast, text: 'Free Delivery Nationwide' }
  ];

  return (
    <div className="login-brand">
      <div className="login-brand-dots" aria-hidden="true" />
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

export default LoginBrandSection;
