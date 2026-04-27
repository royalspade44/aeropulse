import icons from '../common/icons';

function RegisterLegalConsentsStep({ formData, errors, onFieldChange, onNext }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form className="register-step" onSubmit={handleSubmit}>
      <h3 className="register-step-title">Terms &amp; privacy</h3>
      <p className="register-step-desc">Review and accept each item before continuing.</p>

      <div className="terms-group register-legal-stack">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={!!formData.agreeTermsWarranty}
            onChange={(e) => onFieldChange('agreeTermsWarranty', e.target.checked)}
          />
          <span>I agree to the <a href="/terms" target="_blank" rel="noreferrer">warranty terms and conditions</a></span>
        </label>
        {errors.agreeTermsWarranty && (
          <div className="error-message">
            <img src={icons.diamondExclamation} alt="" className="inline-icon" />
            <span>{errors.agreeTermsWarranty}</span>
          </div>
        )}

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={!!formData.agreeTermsService}
            onChange={(e) => onFieldChange('agreeTermsService', e.target.checked)}
          />
          <span>I agree to the <a href="/terms" target="_blank" rel="noreferrer">service terms and conditions</a></span>
        </label>
        {errors.agreeTermsService && (
          <div className="error-message">
            <img src={icons.diamondExclamation} alt="" className="inline-icon" />
            <span>{errors.agreeTermsService}</span>
          </div>
        )}

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={!!formData.agreeTermsApp}
            onChange={(e) => onFieldChange('agreeTermsApp', e.target.checked)}
          />
          <span>I agree to the <a href="/terms" target="_blank" rel="noreferrer">app terms and conditions</a></span>
        </label>
        {errors.agreeTermsApp && (
          <div className="error-message">
            <img src={icons.diamondExclamation} alt="" className="inline-icon" />
            <span>{errors.agreeTermsApp}</span>
          </div>
        )}

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={!!formData.agreePrivacyRa10173}
            onChange={(e) => onFieldChange('agreePrivacyRa10173', e.target.checked)}
          />
          <span>I acknowledge the <a href="/privacy" target="_blank" rel="noreferrer">data privacy disclosure (RA 10173)</a></span>
        </label>
        {errors.agreePrivacyRa10173 && (
          <div className="error-message">
            <img src={icons.diamondExclamation} alt="" className="inline-icon" />
            <span>{errors.agreePrivacyRa10173}</span>
          </div>
        )}
      </div>

      <button type="submit" className="register-button">
        Continue
      </button>
    </form>
  );
}

export default RegisterLegalConsentsStep;
