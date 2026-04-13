import { useState, useCallback, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Register.css';
import RegisterBrandSection from './RegisterBrandSection';
import RegisterLegalConsentsStep from './RegisterLegalConsentsStep';
import RegisterEmailOtpStep from './RegisterEmailOtpStep';
import RegisterProfilePasswordStep from './RegisterProfilePasswordStep';
import RegisterPhoneOtpStep from './RegisterPhoneOtpStep';
import { validateRegistrationProfile } from '../../domain/register/validateRegistrationProfile';
import { consumePostRegistrationCheckoutIntent, setPostRegistrationCheckoutIntent } from '../../domain/checkout/postRegistrationIntent';

const STEPS = ['legal', 'email', 'profile', 'phone'];

function Register() {
  const { register } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [stepIndex, setStepIndex] = useState(0);
  const [totpSecret, setTotpSecret] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    alias: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    address: '',
    agreeTermsWarranty: false,
    agreeTermsService: false,
    agreeTermsApp: false,
    agreePrivacyRa10173: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.returnToCheckout) {
      setPostRegistrationCheckoutIntent();
    }
  }, [location.state]);

  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const validateLegal = () => {
    const e = {};
    if (!formData.agreeTermsWarranty) e.agreeTermsWarranty = 'Required';
    if (!formData.agreeTermsService) e.agreeTermsService = 'Required';
    if (!formData.agreeTermsApp) e.agreeTermsApp = 'Required';
    if (!formData.agreePrivacyRa10173) e.agreePrivacyRa10173 = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const handleLegalNext = () => {
    if (validateLegal()) goNext();
  };

  const persistLocalSecurity = (email) => {
    try {
      const key = 'aeropulse_user_security';
      const map = JSON.parse(localStorage.getItem(key) || '{}');
      map[email] = { alias: formData.alias, totpSecret, updatedAt: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify(map));
    } catch {
      /* ignore */
    }
  };

  const handleFinalSubmit = async () => {
    const { errors: vErrors, valid } = validateRegistrationProfile(formData);
    if (!valid) {
      setErrors(vErrors);
      return;
    }

    setLoading(true);
    try {
      await register({
        name: `${formData.firstName} ${formData.lastName}`,
        name_first: formData.firstName,
        name_last: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        address: formData.address || ''
      });
      persistLocalSecurity(formData.email);
      const returnCheckout = consumePostRegistrationCheckoutIntent();
      alert(returnCheckout ? 'Account created. Continue to checkout to finish your purchase.' : 'Registration successful!');
      navigate(returnCheckout ? '/checkout' : '/home');
    } catch (err) {
      setErrors((prev) => ({ ...prev, email: err.message }));
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const step = STEPS[stepIndex];

  return (
    <div className="register-container">
      <div className="register-grid">
        <RegisterBrandSection />

        <div className="register-form-section">
          <div className="form-header">
            <h2>Create an account</h2>
            <p>Step {stepIndex + 1} of {STEPS.length}</p>
          </div>

          <div className="register-step-indicator">
            {STEPS.map((s, i) => (
              <span key={s} className={`register-step-dot ${i === stepIndex ? 'active' : ''} ${i < stepIndex ? 'done' : ''}`} />
            ))}
          </div>

          {step === 'legal' && (
            <RegisterLegalConsentsStep
              formData={formData}
              errors={errors}
              onFieldChange={handleFieldChange}
              onNext={handleLegalNext}
            />
          )}
          {step === 'email' && (
            <RegisterEmailOtpStep
              formData={formData}
              errors={errors}
              onFieldChange={handleFieldChange}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {step === 'profile' && (
            <RegisterProfilePasswordStep
              formData={formData}
              errors={errors}
              onFieldChange={handleFieldChange}
              onNext={goNext}
              onBack={goBack}
              totpSecret={totpSecret}
              onTotpSecret={setTotpSecret}
            />
          )}
          {step === 'phone' && (
            <RegisterPhoneOtpStep
              formData={formData}
              errors={errors}
              onFieldChange={handleFieldChange}
              onSubmit={handleFinalSubmit}
              onBack={goBack}
              loading={loading}
            />
          )}

          <div className="login-link" style={{ marginTop: 24 }}>
            Already have an account?{' '}
            <button type="button" onClick={() => navigate('/login')}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
