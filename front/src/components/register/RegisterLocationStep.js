import { useState } from 'react';
import InputField from '../common/InputField';
import icons from '../common/icons';
import { getRegions, getProvincesByRegion, getCitiesByProvince, getBarangaysByCity } from '../../domain/location/addressSelectors';

function RegisterLocationStep({ formData, errors, onFieldChange, onNext, onBack }) {
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationSuccess, setLocationSuccess] = useState('');

  const regions = getRegions();
  const provinces = getProvincesByRegion(formData.location?.address?.region || '');
  const cities = getCitiesByProvince(formData.location?.address?.region || '', formData.location?.address?.province || '');
  const barangays = getBarangaysByCity(formData.location?.address?.region || '', formData.location?.address?.province || '', formData.location?.address?.city || '');

  const updateLocationField = (field, value) => {
    const updatedLocation = {
      ...formData.location,
      address: {
        ...formData.location.address,
        [field]: value,
      },
    };

    // Cascade clearing for dependent fields
    if (field === 'region') {
      updatedLocation.address.province = '';
      updatedLocation.address.city = '';
      updatedLocation.address.barangay = '';
    } else if (field === 'province') {
      updatedLocation.address.city = '';
      updatedLocation.address.barangay = '';
    } else if (field === 'city') {
      updatedLocation.address.barangay = '';
    }

    onFieldChange('location', updatedLocation);
  };

  const updateCoordinates = (coordinates) => {
    const updatedLocation = {
      ...formData.location,
      coordinates: {
        ...formData.location.coordinates,
        ...coordinates,
        timestamp: new Date().toISOString(),
      },
      source: 'gps',
    };
    onFieldChange('location', updatedLocation);
  };

  const captureLocation = () => {
    setIsCapturingLocation(true);
    setLocationError('');
    setLocationSuccess('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      setIsCapturingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        updateCoordinates({
          latitude,
          longitude,
          accuracy,
        });
        setLocationSuccess(`Location captured: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setIsCapturingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'Unable to retrieve your location.';
            break;
        }
        setLocationError(errorMessage);
        setIsCapturingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const clearLocation = () => {
    const clearedLocation = {
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
    };
    onFieldChange('location', clearedLocation);
    setLocationError('');
    setLocationSuccess('');
  };

  const hasCoordinates = formData.location?.coordinates?.latitude && formData.location?.coordinates?.longitude;
  const hasAddress = formData.location?.address?.region && formData.location?.address?.province && formData.location?.address?.city;

  const handleNext = () => {
    // Location is optional, so we can proceed even without it
    onNext();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleNext();
  };

  return (
    <form className="register-step" onSubmit={handleSubmit}>
      <h3 className="register-step-title">Location</h3>
      <p className="register-step-desc">Help us provide better service by sharing your location (optional)</p>

      {/* GPS Location Capture */}
      <div className="location-capture-section">
        <div className="location-capture-header">
          <h4>GPS Location</h4>
          <p>Capture your current location for better service</p>
        </div>

        <div className="location-capture-controls">
          <button
            type="button"
            className={`location-capture-btn ${isCapturingLocation ? 'capturing' : ''}`}
            onClick={captureLocation}
            disabled={isCapturingLocation}
          >
            {isCapturingLocation ? (
              <>
                <div className="spinner"></div>
                Capturing...
              </>
            ) : (
              <>
                {icons.marker}
                Capture Location
              </>
            )}
          </button>

          {hasCoordinates && (
            <button
              type="button"
              className="location-clear-btn"
              onClick={clearLocation}
            >
              Clear Location
            </button>
          )}
        </div>

        {locationError && (
          <div className="location-message error">
            {icons.diamondExclamation}
            {locationError}
          </div>
        )}

        {locationSuccess && (
          <div className="location-message success">
            {icons.checkCircle}
            {locationSuccess}
          </div>
        )}

        {hasCoordinates && (
          <div className="location-coordinates">
            <div className="coordinate-item">
              <label>Latitude:</label>
              <span>{formData.location.coordinates.latitude.toFixed(6)}</span>
            </div>
            <div className="coordinate-item">
              <label>Longitude:</label>
              <span>{formData.location.coordinates.longitude.toFixed(6)}</span>
            </div>
            {formData.location.coordinates.accuracy && (
              <div className="coordinate-item">
                <label>Accuracy:</label>
                <span>±{Math.round(formData.location.coordinates.accuracy)}m</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Address Input */}
      <div className="location-address-section">
        <div className="location-address-header">
          <h4>Address Information</h4>
          <p>Provide your address details (optional)</p>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Region</label>
            <select
              value={formData.location?.address?.region || ''}
              onChange={(e) => updateLocationField('region', e.target.value)}
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Province</label>
            <select
              value={formData.location?.address?.province || ''}
              onChange={(e) => updateLocationField('province', e.target.value)}
              disabled={!formData.location?.address?.region}
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City / Municipality</label>
            <select
              value={formData.location?.address?.city || ''}
              onChange={(e) => updateLocationField('city', e.target.value)}
              disabled={!formData.location?.address?.province}
            >
              <option value="">Select City / Municipality</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Barangay</label>
            <select
              value={formData.location?.address?.barangay || ''}
              onChange={(e) => updateLocationField('barangay', e.target.value)}
              disabled={!formData.location?.address?.city}
            >
              <option value="">Select Barangay</option>
              {barangays.map((barangay) => (
                <option key={barangay} value={barangay}>{barangay}</option>
              ))}
            </select>
          </div>
        </div>

        <InputField
          label="Street Address"
          type="text"
          placeholder="House/Block/Lot No., Street Name"
          value={formData.location?.address?.street || ''}
          onChange={(value) => updateLocationField('street', value)}
        />

        <div className="form-row">
          <div className="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              placeholder="Postal code"
              value={formData.location?.address?.postalCode || ''}
              onChange={(e) => updateLocationField('postalCode', e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              inputMode="numeric"
            />
          </div>
        </div>
      </div>

      {/* Location Summary */}
      {(hasCoordinates || hasAddress) && (
        <div className="location-summary">
          <h4>Location Summary</h4>
          <div className="location-summary-content">
            {hasCoordinates && (
              <div className="summary-item">
                <strong>GPS:</strong> {formData.location.coordinates.latitude.toFixed(4)}, {formData.location.coordinates.longitude.toFixed(4)}
              </div>
            )}
            {hasAddress && (
              <div className="summary-item">
                <strong>Address:</strong> {[
                  formData.location.address.street,
                  formData.location.address.barangay,
                  formData.location.address.city,
                  formData.location.address.province,
                  formData.location.address.region,
                ].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="register-step-navigation">
        <button type="button" className="back-btn" onClick={onBack}>
          Back
        </button>
        <button type="submit" className="next-btn">
          Complete Registration
        </button>
      </div>
    </form>
  );
}

export default RegisterLocationStep;