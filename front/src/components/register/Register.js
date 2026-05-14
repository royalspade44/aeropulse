import { useState, useCallback, useEffect, useMemo } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Register.css';
import RegisterBrandSection from './RegisterBrandSection';
import RegisterLegalConsentsStep from './RegisterLegalConsentsStep';
import RegisterEmailOtpStep from './RegisterEmailOtpStep';
import RegisterProfilePasswordStep from './RegisterProfilePasswordStep';
import RegisterPhoneOtpStep from './RegisterPhoneOtpStep';
import RegisterLocationStep from './RegisterLocationStep';
import { validateRegistrationProfile, validateProfileAndSecurityStep } from '../../domain/register/validateRegistrationProfile';
import { setPostRegistrationCheckoutIntent } from '../../domain/checkout/postRegistrationIntent';
import { detectRoleFromEmail, getRoleLabel } from '../../domain/register/detectRoleFromEmail';

const STEPS = ['legal', 'email', 'profile', 'phone', 'location'];

function Register() {
  const { register } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    alias: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    billingRegion: '',
    billingProvince: '',
    billingCity: '',
    billingBarangay: '',
    billingStreet: '',
    branch: '',
    agreeTermsWarranty: false,
    agreeTermsService: false,
    agreeTermsApp: false,
    agreePrivacyRa10173: false,
    // Location data
    location: {
      coordinates: {
        latitude: null,
        longitude: null,
        accuracy: null,
        timestamp: null,
      },
      address: {
        region: '',
        province: '',
        city: '',
        barangay: '',
        street: '',
        postalCode: '',
      },
      source: 'manual',
    },
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

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

  const handleBillingFieldChange = useCallback((field, value) => {
    setFormData((prev) => {
      if (field === 'billingRegion') {
        return {
          ...prev,
          billingRegion: value,
          billingProvince: '',
          billingCity: '',
          billingBarangay: '',
        };
      }

      if (field === 'billingProvince') {
        return {
          ...prev,
          billingProvince: value,
          billingCity: '',
          billingBarangay: '',
        };
      }

      if (field === 'billingCity') {
        return {
          ...prev,
          billingCity: value,
          billingBarangay: '',
        };
      }

      return { ...prev, [field]: value };
    });

    setErrors((prev) => {
      const next = { ...prev };
      next[field] = '';
      if (field === 'billingRegion') {
        next.billingProvince = '';
        next.billingCity = '';
        next.billingBarangay = '';
      }
      if (field === 'billingProvince') {
        next.billingCity = '';
        next.billingBarangay = '';
      }
      if (field === 'billingCity') {
        next.billingBarangay = '';
      }
      return next;
    });
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
      map[email] = { alias: formData.alias, updatedAt: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify(map));
    } catch {
      /* ignore */
    }
  };

  const handleFinalSubmit = async () => {
    setSubmissionError('');
    const { errors: vErrors, valid } = validateRegistrationProfile(formData, detectedRole);
    if (!valid) {
      console.warn('[Register] Validation failed before submit', vErrors);
      setErrors(vErrors);
      const firstError = Object.values(vErrors)[0];
      if (firstError) {
        setSubmissionError(firstError);
        alert(firstError);
      }
      return;
    }

    setLoading(true);
    try {
      const normalizedPhone = String(formData.phone || '').replace(/\D/g, '');
      const billingAddress = {
        region: String(formData.billingRegion || '').trim(),
        province: String(formData.billingProvince || '').trim(),
        city: String(formData.billingCity || '').trim(),
        barangay: String(formData.billingBarangay || '').trim(),
        street: String(formData.billingStreet || '').trim(),
      };
      const normalizedAddress = [
        billingAddress.street,
        billingAddress.barangay,
        billingAddress.city,
        billingAddress.province,
        billingAddress.region,
      ].filter(Boolean).join(', ');
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        name_first: formData.firstName,
        name_last: formData.lastName,
        alias: formData.alias,
        email: formData.email,
        phone: normalizedPhone,
        password: formData.password,
        address: detectedRole === 'customer' ? normalizedAddress : '',
        billingAddress: detectedRole === 'customer' ? billingAddress : null,
        branch: detectedRole !== 'customer' ? formData.branch : undefined,
        location: formData.location,
      };

      console.log('[Register] Sending registration request', {
        email: payload.email,
        detectedRole,
        hasPhone: Boolean(payload.phone),
        hasAddress: Boolean(payload.address),
        hasStructuredBilling: Boolean(payload.billingAddress?.region),
        hasLocation: Boolean(payload.location?.coordinates?.latitude || payload.location?.address?.region),
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
      const normalizedMessage = err.message === 'Failed to fetch' || err.message?.includes('Server unreachable')
        ? 'Server unreachable. Please make sure the backend is running and CORS is enabled.'
        : err.message || 'Unable to register. Please try again.';

      if (err?.fieldErrors && typeof err.fieldErrors === 'object') {
        setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
        const firstError = Object.values(err.fieldErrors)[0];
        setSubmissionError(firstError || normalizedMessage);
        alert(`Registration failed: ${firstError || normalizedMessage}`);
      } else {
        setSubmissionError(normalizedMessage);
        setErrors((prev) => ({ ...prev, email: normalizedMessage }));
        alert(`Registration failed: ${normalizedMessage}`);
      }
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
            />
          )}
          {step === 'phone' && (
            <RegisterPhoneOtpStep
              formData={formData}
              errors={errors}
              onFieldChange={handleFieldChange}
              onBillingFieldChange={handleBillingFieldChange}
              detectedRole={detectedRole}
              onSubmit={handleFinalSubmit}
              onBack={goBack}
              loading={loading}
            />
          )}
          {submissionError && (
            <div className="register-error-banner" role="alert">
              {submissionError}
            </div>
          )}

          {step === 'location' && (
            <RegisterLocationStep
              formData={formData}
              errors={errors}
              onFieldChange={handleFieldChange}
              onNext={handleFinalSubmit}
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
