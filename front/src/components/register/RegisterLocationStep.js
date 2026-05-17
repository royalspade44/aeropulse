import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  MapPin,
  Spinner,
  Trash,
  WarningDiamond,
} from "@phosphor-icons/react";
import { useState } from "react";
import {
  getBarangaysByCity,
  getCitiesByProvince,
  getProvincesByRegion,
  getRegions,
} from "../../domain/location/addressSelectors";
import {
  BQ_COLORS,
  BQ_FONTS,
  BQ_GEOMETRY,
  BQ_SHADOWS,
} from "../common/boutique/BoutiqueTheme";

export default function RegisterLocationStep({
  formData,
  errors,
  onFieldChange,
  onNext,
  onBack,
  loading = false,
}) {
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationSuccess, setLocationSuccess] = useState("");

  const regions = getRegions();
  const provinces = getProvincesByRegion(
    formData.location?.address?.region || "",
  );
  const cities = getCitiesByProvince(
    formData.location?.address?.region || "",
    formData.location?.address?.province || "",
  );
  const barangays = getBarangaysByCity(
    formData.location?.address?.region || "",
    formData.location?.address?.province || "",
    formData.location?.address?.city || "",
  );

  const updateLocationField = (field, value) => {
    const updatedLocation = {
      ...formData.location,
      address: {
        ...formData.location.address,
        [field]: value,
      },
    };

    if (field === "region") {
      updatedLocation.address.province = "";
      updatedLocation.address.city = "";
      updatedLocation.address.barangay = "";
    } else if (field === "province") {
      updatedLocation.address.city = "";
      updatedLocation.address.barangay = "";
    } else if (field === "city") {
      updatedLocation.address.barangay = "";
    }

    onFieldChange("location", updatedLocation);
  };

  const captureLocation = () => {
    setIsCapturingLocation(true);
    setLocationError("");
    setLocationSuccess("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported.");
      setIsCapturingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        try {
          const apiKey =
            process.env.REACT_APP_LOCATIONIQ_KEY || "pk.YOUR_LOCATION_IQ_KEY";
          const response = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=${apiKey}&lat=${latitude}&lon=${longitude}&format=json`,
          );

          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};

            const updatedLocation = {
              ...formData.location,
              coordinates: {
                latitude,
                longitude,
                accuracy,
                timestamp: new Date().toISOString(),
              },
              address: {
                region: addr.region || addr.state || "",
                province: addr.province || addr.county || "",
                city:
                  addr.city ||
                  addr.municipality ||
                  addr.town ||
                  addr.village ||
                  "",
                barangay: addr.suburb || addr.neighbourhood || "",
                street: [addr.road, addr.house_number]
                  .filter(Boolean)
                  .join(" "),
                postalCode: addr.postcode || "",
              },
              source: "gps",
            };
            onFieldChange("location", updatedLocation);
            setLocationSuccess(
              `Location resolved: ${updatedLocation.address.city}`,
            );
          }
        } catch (err) {
          setLocationSuccess(
            `Location captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          );
        }
        setIsCapturingLocation(false);
      },
      (error) => {
        setLocationError("Unable to retrieve location.");
        setIsCapturingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const clearLocation = () => {
    const cleared = {
      coordinates: {
        latitude: null,
        longitude: null,
        accuracy: null,
        timestamp: null,
      },
      address: {
        region: "",
        province: "",
        city: "",
        barangay: "",
        street: "",
        postalCode: "",
      },
      source: "manual",
    };
    onFieldChange("location", cleared);
    setLocationError("");
    setLocationSuccess("");
  };

  const hasCoordinates = formData.location?.coordinates?.latitude;
  const hasAddress = formData.location?.address?.city;

  return (
    <form
      className="bq-reg-step"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <div className="bq-reg-header">
        <h3 className="bq-reg-title">Location</h3>
        <p className="bq-reg-desc">
          Share your location for personalized service (optional).
        </p>
      </div>

      <div className="bq-location-card">
        <div className="bq-loc-header">
          <MapPin size={24} weight="fill" color={BQ_COLORS.brand} />
          <div className="bq-loc-title-wrap">
            <h4>Precision GPS</h4>
            <p>Resolve your address instantly</p>
          </div>
        </div>

        <div className="bq-loc-actions">
          <button
            type="button"
            className={`bq-loc-btn ${isCapturingLocation ? "loading" : ""}`}
            onClick={captureLocation}
            disabled={isCapturingLocation}
          >
            {isCapturingLocation ? (
              <Spinner className="bq-spin" size={20} />
            ) : (
              <MapPin size={20} weight="bold" />
            )}
            {isCapturingLocation ? "Locating..." : "Auto-Capture Location"}
          </button>

          {hasCoordinates && (
            <button
              type="button"
              className="bq-loc-clear"
              onClick={clearLocation}
            >
              <Trash size={18} />
            </button>
          )}
        </div>

        {locationError && (
          <div className="bq-loc-msg error">
            <WarningDiamond size={16} weight="bold" /> {locationError}
          </div>
        )}
        {locationSuccess && (
          <div className="bq-loc-msg success">
            <CheckCircle size={16} weight="bold" /> {locationSuccess}
          </div>
        )}
      </div>

      <div className="bq-reg-form-grid">
        <div className="bq-reg-input-group">
          <label className="bq-reg-label">Region</label>
          <select
            value={formData.location?.address?.region || ""}
            onChange={(e) => updateLocationField("region", e.target.value)}
            className="bq-reg-input bq-reg-select"
          >
            <option value="">Select Region</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="bq-reg-input-group">
          <label className="bq-reg-label">Province</label>
          <select
            value={formData.location?.address?.province || ""}
            onChange={(e) => updateLocationField("province", e.target.value)}
            disabled={!formData.location?.address?.region}
            className="bq-reg-input bq-reg-select"
          >
            <option value="">Select Province</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="bq-reg-input-group">
          <label className="bq-reg-label">City</label>
          <select
            value={formData.location?.address?.city || ""}
            onChange={(e) => updateLocationField("city", e.target.value)}
            disabled={!formData.location?.address?.province}
            className="bq-reg-input bq-reg-select"
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="bq-reg-input-group">
          <label className="bq-reg-label">Barangay</label>
          <select
            value={formData.location?.address?.barangay || ""}
            onChange={(e) => updateLocationField("barangay", e.target.value)}
            disabled={!formData.location?.address?.city}
            className="bq-reg-input bq-reg-select"
          >
            <option value="">Select Barangay</option>
            {barangays.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="bq-reg-input-group full-width">
          <label className="bq-reg-label">Street Address</label>
          <input
            type="text"
            placeholder="House No., Building, Street"
            value={formData.location?.address?.street || ""}
            onChange={(e) => updateLocationField("street", e.target.value)}
            className="bq-reg-input"
          />
        </div>
      </div>

      <div className="bq-reg-actions">
        <button
          type="button"
          className="bq-reg-btn bq-reg-btn--ghost"
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeft size={18} weight="bold" /> Back
        </button>
        <button
          type="submit"
          className="bq-reg-btn bq-reg-btn--primary"
          disabled={loading}
        >
          {loading ? "Registering..." : "Complete Setup"}{" "}
          <ArrowRight size={18} weight="bold" />
        </button>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-reg-step { display: flex; flex-direction: column; gap: 32px; width: 100%; }

        .bq-reg-header { margin-bottom: 8px; }
        .bq-reg-title { font-family: ${BQ_FONTS.heading}; font-size: 24px; font-weight: 800; color: ${BQ_COLORS.ink}; margin: 0; }
        .bq-reg-desc { font-size: 15px; color: ${BQ_COLORS.inkMuted}; margin-top: 8px; }

        .bq-location-card {
          padding: 24px; background: ${BQ_COLORS.bgAlt}; border-radius: ${BQ_GEOMETRY.radiusCard};
          display: flex; flex-direction: column; gap: 20px;
        }

        .bq-loc-header { display: flex; align-items: center; gap: 16px; }
        .bq-loc-title-wrap h4 { font-family: ${BQ_FONTS.heading}; font-size: 16px; font-weight: 800; margin: 0; }
        .bq-loc-title-wrap p { font-size: 13px; color: ${BQ_COLORS.inkMuted}; margin: 2px 0 0; }

        .bq-loc-actions { display: flex; gap: 12px; }

        .bq-loc-btn {
          flex: 1; padding: 14px 20px; border-radius: ${BQ_GEOMETRY.radiusPill};
          background: white; border: none; font-family: ${BQ_FONTS.heading};
          font-weight: 800; font-size: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: ${BQ_SHADOWS.soft}; transition: all 0.3s;
        }
        .bq-loc-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: ${BQ_SHADOWS.float}; }

        .bq-loc-clear {
          width: 48px; height: 48px; border-radius: ${BQ_GEOMETRY.radiusPill};
          background: white; border: none; color: ${BQ_COLORS.danger};
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; box-shadow: ${BQ_SHADOWS.soft};
        }

        .bq-loc-msg { font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 12px; }
        .bq-loc-msg.error { background: #fef2f2; color: ${BQ_COLORS.danger}; }
        .bq-loc-msg.success { background: #ecfdf5; color: ${BQ_COLORS.success}; }

        .bq-reg-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .bq-reg-form-grid .full-width { grid-column: span 2; }

        .bq-reg-input-group { display: flex; flex-direction: column; gap: 8px; }
        .bq-reg-label { font-size: 12px; font-weight: 800; color: ${BQ_COLORS.ink}; text-transform: uppercase; letter-spacing: 0.05em; }

        .bq-reg-input {
          width: 100%; padding: 14px 16px; background: ${BQ_COLORS.surfaceAlt};
          border: 1.5px solid ${BQ_COLORS.border}; border-radius: ${BQ_GEOMETRY.radiusMd};
          font-size: 14px; color: ${BQ_COLORS.ink}; transition: all 0.3s;
        }
        .bq-reg-input:focus { outline: none; border-color: ${BQ_COLORS.brand}; background: white; }
        .bq-reg-select { appearance: none; cursor: pointer; }

        .bq-reg-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; }

        .bq-reg-btn {
          padding: 14px 24px; border-radius: ${BQ_GEOMETRY.radiusPill};
          font-family: ${BQ_FONTS.heading}; font-weight: 800; font-size: 14px;
          text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer;
          display: flex; align-items: center; gap: 10px; transition: all 0.3s; border: none;
        }

        .bq-reg-btn--primary { background: ${BQ_COLORS.brand}; color: white; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .bq-reg-btn--primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(0,0,0,0.2); }

        .bq-reg-btn--ghost { background: transparent; color: ${BQ_COLORS.inkMuted}; }

        .bq-spin { animation: bq-spin 1s linear infinite; }
        @keyframes bq-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 640px) { .bq-reg-form-grid { grid-template-columns: 1fr; } .bq-reg-form-grid .full-width { grid-column: span 1; } }
      `,
        }}
      />
    </form>
  );
}
