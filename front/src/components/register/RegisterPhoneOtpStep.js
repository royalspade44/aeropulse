import { useState } from 'react';
import InputField from '../common/InputField';
import icons from '../common/icons';
import {
  getRegions,
  getProvincesByRegion,
  getCitiesByProvince,
  getBarangaysByCity,
} from '../../domain/location/addressSelectors';

function RegisterPhoneOtpStep({ formData, errors, onFieldChange, onBillingFieldChange, detectedRole, onSubmit, onBack, loading }) {
  const [localError, setLocalError] = useState('');
  const isCustomer = detectedRole === 'customer';
  const regions = getRegions();
  const provinces = getProvincesByRegion(formData.billingRegion);
  const cities = getCitiesByProvince(formData.billingRegion, formData.billingProvince);
  const barangays = getBarangaysByCity(formData.billingRegion, formData.billingProvince, formData.billingCity);

  const isValidPhone = (value) => /^(09\d{9}|639\d{9})$/.test(String(value || '').replace(/\D/g, ''));

  const handlePhoneChange = (value) => {
    const normalized = String(value).replace(/\D/g, '').slice(0, 12);
    onFieldChange('phone', normalized);
    if (localError) {
      setLocalError('');
    }
  };

  const handleCreate = () => {
    if (!isValidPhone(formData.phone)) {
      setLocalError('Enter a valid PH mobile number (09XXXXXXXXX or 639XXXXXXXXX).');
      return;
    }
    if (isCustomer) {
      const missingBillingField = !String(formData.billingRegion || '').trim()
        || !String(formData.billingProvince || '').trim()
        || !String(formData.billingCity || '').trim()
        || !String(formData.billingBarangay || '').trim()
        || !String(formData.billingStreet || '').trim();
      if (missingBillingField) {
        setLocalError('Complete billing address details are required for customer accounts.');
        return;
      }
    }
    console.log('[Register][Step4] Submitting final step', {
      hasPhone: Boolean(formData.phone),
      detectedRole,
      isCustomer,
      hasBillingAddress: Boolean(formData.billingStreet && formData.billingCity),
    });

    setLocalError('');
    onSubmit();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCreate();
  };

  return (
    <form className="register-step" onSubmit={handleSubmit}>
      <h3 className="register-step-title">Mobile number</h3>
      <p className="register-step-desc">PH mobile number (verification disabled for this demo).</p>

      <InputField
        label="Phone number"
        type="tel"
        placeholder="09xx or 639xx"
        value={formData.phone}
        onChange={handlePhoneChange}
        error={errors.phone}
        required
      />

      {localError && (
        <div className="error-message">
          <img src={icons.diamondExclamation} alt="" className="inline-icon" />
          <span>{localError}</span>
        </div>
      )}

      {isCustomer && (
        <section className="register-billing-section" aria-label="Billing address section">
          <h4 className="register-billing-title">Billing Address</h4>
          <p className="register-billing-desc">Select your area details like Shopee checkout before creating your account.</p>

          <div className="form-row">
            <div className="input-group">
              <label>Region <span className="required-star">*</span></label>
              <select
                value={formData.billingRegion}
                onChange={(e) => onBillingFieldChange('billingRegion', e.target.value)}
                className={errors.billingRegion ? 'input-error' : ''}
              >
                <option value="">Select Region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              {errors.billingRegion && (
                <div className="error-message">
                  <img src={icons.diamondExclamation} alt="" className="inline-icon" />
                  <span>{errors.billingRegion}</span>
                </div>
              )}
            </div>

            <div className="input-group">
              <label>Province <span className="required-star">*</span></label>
              <select
                value={formData.billingProvince}
                onChange={(e) => onBillingFieldChange('billingProvince', e.target.value)}
                disabled={!formData.billingRegion}
                className={errors.billingProvince ? 'input-error' : ''}
              >
                <option value="">Select Province</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
              {errors.billingProvince && (
                <div className="error-message">
                  <img src={icons.diamondExclamation} alt="" className="inline-icon" />
                  <span>{errors.billingProvince}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>City / Municipality <span className="required-star">*</span></label>
              <select
                value={formData.billingCity}
                onChange={(e) => onBillingFieldChange('billingCity', e.target.value)}
                disabled={!formData.billingProvince}
                className={errors.billingCity ? 'input-error' : ''}
              >
                <option value="">Select City / Municipality</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.billingCity && (
                <div className="error-message">
                  <img src={icons.diamondExclamation} alt="" className="inline-icon" />
                  <span>{errors.billingCity}</span>
                </div>
              )}
            </div>

            <div className="input-group">
              <label>Barangay <span className="required-star">*</span></label>
              <select
                value={formData.billingBarangay}
                onChange={(e) => onBillingFieldChange('billingBarangay', e.target.value)}
                disabled={!formData.billingCity}
                className={errors.billingBarangay ? 'input-error' : ''}
              >
                <option value="">Select Barangay</option>
                {barangays.map((barangay) => (
                  <option key={barangay} value={barangay}>{barangay}</option>
                ))}
              </select>
              {errors.billingBarangay && (
                <div className="error-message">
                  <img src={icons.diamondExclamation} alt="" className="inline-icon" />
                  <span>{errors.billingBarangay}</span>
                </div>
              )}
            </div>
          </div>

          <InputField
            label="Street / House No."
            type="text"
            placeholder="House/Block/Lot No., Street"
            value={formData.billingStreet}
            onChange={(value) => onBillingFieldChange('billingStreet', value)}
            error={errors.billingStreet}
            required
          />

          <div className="register-delivery-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.useAsDelivery || false}
                onChange={(e) => onFieldChange('useAsDelivery', e.target.checked)}
              />
              <span>Use as delivery location</span>
            </label>
          </div>
        </section>
      )}

      <div className="register-step-actions">
        <button type="button" className="cancel-btn" onClick={onBack} disabled={loading}>
          Back
        </button>
        <button type="submit" className="register-button" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </div>
    </form>
  );
}

export default RegisterPhoneOtpStep;
