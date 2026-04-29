import coldAirLogo from './images/Cold Air Logo.jpg';

function CustomerHeaderBrand({ light = false }) {
  return (
    <div className={`customer-header-brand ${light ? 'customer-header-brand--light' : ''}`}>
      <span className="customer-header-brand-logo" aria-hidden="true">
        <img src={coldAirLogo} alt="" />
      </span>
      <span className="customer-header-brand-text">
        <strong>COLD AIR</strong>
        <small>Airconditioning Trading</small>
      </span>
    </div>
  );
}

export default CustomerHeaderBrand;
