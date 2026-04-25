import { useState, useCallback, useEffect, useMemo } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Register.css';
import RegisterBrandSection from './RegisterBrandSection';
import RegisterLegalConsentsStep from './RegisterLegalConsentsStep';
import RegisterEmailOtpStep from './RegisterEmailOtpStep';
import RegisterProfilePasswordStep from './RegisterProfilePasswordStep';
import RegisterPhoneOtpStep from './RegisterPhoneOtpStep';
import { validateRegistrationProfile, validateProfileAndSecurityStep } from '../../domain/register/validateRegistrationProfile';
import { setPostRegistrationCheckoutIntent } from '../../domain/checkout/postRegistrationIntent';
import { detectRoleFromEmail, getRoleLabel } from '../../domain/register/detectRoleFromEmail';

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
    emailOtp: '',
    totpCode: '',
    smsCode: '',
    address: '',
    agreeTermsWarranty: false,
    agreeTermsService: false,
    agreeTermsApp: false,
    agreePrivacyRa10173: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const detectedRole = useMemo(() => detectRoleFromEmail(formData.email), [formData.email]);
  const detectedRoleLabel = useMemo(() => getRoleLabel(detectedRole), [detectedRole]);

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

  const handleProfileNext = () => {
    const { errors: stepErrors, valid } = validateProfileAndSecurityStep(formData);
    if (!valid) {
      console.warn('[Register] Profile step validation failed', stepErrors);
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      return;
    }
    goNext();
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
    const { errors: vErrors, valid } = validateRegistrationProfile(formData, detectedRole);
    if (!valid) {
      console.warn('[Register] Validation failed before submit', vErrors);
      setErrors(vErrors);
      const firstError = Object.values(vErrors)[0];
      if (firstError) {
        alert(firstError);
      }
      return;
    }

    setLoading(true);
    try {
      const normalizedPhone = String(formData.phone || '').replace(/\D/g, '');
      const normalizedAddress = String(formData.address || '').trim();
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        name_first: formData.firstName,
        name_last: formData.lastName,
        email: formData.email,
        phone: normalizedPhone,
        password: formData.password,
        address: detectedRole === 'customer' ? normalizedAddress : '',
        emailOtp: formData.emailOtp,
        totpCode: formData.totpCode,
        smsCode: formData.smsCode,
      };

      console.log('[Register] Sending registration request', {
        email: payload.email,
        detectedRole,
        hasPhone: Boolean(payload.phone),
        hasAddress: Boolean(payload.address),
      });

      await register({
        ...payload,
      });

      console.log('[Register] Registration succeeded', { email: formData.email, detectedRole });
      persistLocalSecurity(formData.email);
      alert('Registration successful! Please sign in to continue.');
      navigate('/login');
    } catch (err) {
      console.error('[Register] Registration failed', err);
      setErrors((prev) => ({ ...prev, email: err.message }));
      alert(`Registration failed: ${err.message || 'Please try again.'}`);
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

          {detectedRole !== 'customer' && (
            <div className="register-role-pill">
              Detected account type: <strong>{detectedRoleLabel}</strong>
            </div>
          )}

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
              detectedRole={detectedRole}
              detectedRoleLabel={detectedRoleLabel}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {step === 'profile' && (
            <RegisterProfilePasswordStep
              formData={formData}
              errors={errors}
              onFieldChange={handleFieldChange}
              detectedRole={detectedRole}
              detectedRoleLabel={detectedRoleLabel}
              onNext={handleProfileNext}
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
              detectedRole={detectedRole}
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
