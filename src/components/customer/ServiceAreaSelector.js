import { useState, useEffect } from 'react';
import { SERVICE_AREAS, DEFAULT_SERVICE_AREA_ID, getServiceAreaById } from '../../domain/purchase/serviceAreas';
import { getStoredServiceAreaId, setStoredServiceAreaId } from '../../domain/purchase/serviceAreaStorage';
import { requestDeviceCoordinates } from '../../domain/purchase/geolocationHint';
import './ServiceAreaSelector.css';

function ServiceAreaSelector({ onAreaChange }) {
  const [areaId, setAreaId] = useState(() => getStoredServiceAreaId() || DEFAULT_SERVICE_AREA_ID);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState(null);

  useEffect(() => {
    const stored = getStoredServiceAreaId() || DEFAULT_SERVICE_AREA_ID;
    setAreaId(stored);
    if (!getStoredServiceAreaId()) setStoredServiceAreaId(DEFAULT_SERVICE_AREA_ID);
    onAreaChange?.(getServiceAreaById(stored));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- notify parent once on mount
  }, []);

  const handleSelect = (id) => {
    setAreaId(id);
    setStoredServiceAreaId(id);
    onAreaChange?.(getServiceAreaById(id));
  };

  const handleGps = async () => {
    setGpsLoading(true);
    setGpsCoords(null);
    const coords = await requestDeviceCoordinates();
    setGpsLoading(false);
    if (coords) {
      setGpsCoords(coords);
      // Without reverse-geocoding API, customer must still confirm region.
      alert(
        `Location captured (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}). Please select your service area below. IP-based detection would be added server-side.`
      );
    } else {
      alert('Could not read device location. Enable GPS or pick your area manually.');
    }
  };

  return (
    <div className="service-area-selector">
      <div className="service-area-header">
        <h3>Service area</h3>
        <p>Pricing and delivery use your selected region (Cavite, Laguna, Bulacan, Pangasinan, Bataan, Ilocos).</p>
      </div>
      <div className="service-area-actions">
        <button type="button" className="service-area-gps-btn" onClick={handleGps} disabled={gpsLoading}>
          {gpsLoading ? 'Detecting…' : 'Use device location (GPS)'}
        </button>
        {gpsCoords && (
          <span className="service-area-gps-note">Coords saved for confirmation — pick matching area.</span>
        )}
      </div>
      <div className="service-area-chips">
        {SERVICE_AREAS.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`service-area-chip ${areaId === a.id ? 'active' : ''}`}
            onClick={() => handleSelect(a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ServiceAreaSelector;
