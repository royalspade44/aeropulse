import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  NavigationArrow,
  Plus,
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
import BoutiqueButton from "../common/boutique/BoutiqueButton";
import BoutiqueInput from "../common/boutique/BoutiqueInput";
import {
  BQ_COLORS,
  BQ_FONTS,
  BQ_SHADOWS,
} from "../common/boutique/BoutiqueTheme";

const INITIAL_ADDRESS = {
  region: "",
  province: "",
  city: "",
  barangay: "",
  street: "",
};

const INITIAL_LOCATION = {
  coordinates: {
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
  },
  address: { ...INITIAL_ADDRESS },
  source: "manual",
};

export default function RegisterLocationStep({
  formData,
  onFieldChange,
  onNext,
  onBack,
  loading = false,
}) {
  // Defensive guard for locations array
  const locations = formData.locations || [];

  const [showAddForm, setShowAddForm] = useState(locations.length === 0);
  const [currentLoc, setCurrentLoc] = useState({ ...INITIAL_LOCATION });
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState("");

  const regions = getRegions();
  const provinces = getProvincesByRegion(currentLoc.address.region);
  const cities = getCitiesByProvince(
    currentLoc.address.region,
    currentLoc.address.province,
  );
  const barangays = getBarangaysByCity(
    currentLoc.address.region,
    currentLoc.address.province,
    currentLoc.address.city,
  );

  const updateField = (field, value) => {
    const updated = {
      ...currentLoc,
      address: { ...currentLoc.address, [field]: value },
    };
    if (field === "region") {
      updated.address.province = "";
      updated.address.city = "";
      updated.address.barangay = "";
    } else if (field === "province") {
      updated.address.city = "";
      updated.address.barangay = "";
    } else if (field === "city") {
      updated.address.barangay = "";
    }
    setCurrentLoc(updated);
  };

  const captureGps = () => {
    setIsCapturing(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      setIsCapturing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        try {
          const apiKey =
            process.env.REACT_APP_LOCATIONIQ_KEY || "pk.YOUR_LOCATION_IQ_KEY";
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=${apiKey}&lat=${latitude}&lon=${longitude}&format=json`,
          );

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            setCurrentLoc({
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
              },
              source: "gps",
            });
          }
        } catch (err) {
          setCurrentLoc((prev) => ({
            ...prev,
            coordinates: {
              latitude,
              longitude,
              accuracy,
              timestamp: new Date().toISOString(),
            },
            source: "gps",
          }));
        }
        setIsCapturing(false);
      },
      () => {
        setError("Permission denied.");
        setIsCapturing(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const addLocation = () => {
    if (!currentLoc.address.city || !currentLoc.address.street) {
      setError("City and Street Address are required.");
      return;
    }
    const updated = [...locations, { ...currentLoc }];
    onFieldChange("locations", updated);
    setCurrentLoc({ ...INITIAL_LOCATION });
    setShowAddForm(false);
    setError("");
  };

  const removeLocation = (index) => {
    const updated = locations.filter((_, i) => i !== index);
    onFieldChange("locations", updated);
    if (updated.length === 0) setShowAddForm(true);
  };

  return (
    <div className="bq-location-flow bq-fade-in">
      <div className="bq-flow-header">
        <h3 className="bq-flow-title">Facility Hub</h3>
        <p className="bq-flow-desc">
          Register one or more locations for optimized service logistics.
        </p>
      </div>

      {/* LIST OF ADDED LOCATIONS */}
      {locations.length > 0 && (
        <div className="bq-loc-list">
          {locations.map((loc, i) => (
            <div key={i} className="bq-loc-item bq-slide-down">
              <div className="bq-loc-item-info">
                <MapPin size={20} weight="fill" color={BQ_COLORS.accent} />
                <div className="bq-loc-item-text">
                  <span className="bq-loc-item-city">
                    {loc.address.city}, {loc.address.barangay}
                  </span>
                  <span className="bq-loc-item-street">
                    {loc.address.street}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="bq-loc-item-remove"
                onClick={() => removeLocation(i)}
              >
                <Trash size={18} weight="bold" />
              </button>
            </div>
          ))}

          {!showAddForm && (
            <button
              type="button"
              className="bq-add-another-btn"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={16} weight="bold" /> Add Another Facility
            </button>
          )}
        </div>
      )}

      {/* ADD FORM */}
      {showAddForm && (
        <div className="bq-loc-add-form bq-fade-in">
          <div className="bq-gps-hub">
            <div className="bq-hub-content">
              <div className="bq-hub-text">
                <span className="bq-hub-label">Technical Assist</span>
                <h4 className="bq-hub-value">GPS Auto-Capture</h4>
              </div>
              <BoutiqueButton
                type="button"
                variant={currentLoc.source === "gps" ? "outline" : "primary"}
                size="sm"
                onClick={captureGps}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <Spinner className="bq-spin" size={16} />
                ) : (
                  <NavigationArrow size={16} weight="bold" />
                )}
                {isCapturing ? "Acquiring..." : "Sync Position"}
              </BoutiqueButton>
            </div>
            {error && (
              <div className="bq-hub-error">
                <WarningDiamond size={14} weight="bold" /> {error}
              </div>
            )}
          </div>

          <div className="bq-address-grid">
            <BoutiqueInput
              label="Region"
              type="select"
              value={currentLoc.address.region}
              onChange={(e) => updateField("region", e.target.value)}
              options={regions.map((r) => ({ value: r, label: r }))}
              placeholder="Select Region"
            />
            <BoutiqueInput
              label="Province"
              type="select"
              value={currentLoc.address.province}
              onChange={(e) => updateField("province", e.target.value)}
              disabled={!currentLoc.address.region}
              options={provinces.map((p) => ({ value: p, label: p }))}
              placeholder="Select Province"
            />
            <BoutiqueInput
              label="City"
              type="select"
              value={currentLoc.address.city}
              onChange={(e) => updateField("city", e.target.value)}
              disabled={!currentLoc.address.province}
              options={cities.map((c) => ({ value: c, label: c }))}
              placeholder="Select City"
            />
            <BoutiqueInput
              label="Barangay"
              type="select"
              value={currentLoc.address.barangay}
              onChange={(e) => updateField("barangay", e.target.value)}
              disabled={!currentLoc.address.city}
              options={barangays.map((b) => ({ value: b, label: b }))}
              placeholder="Select Barangay"
            />
            <div className="bq-grid-full">
              <BoutiqueInput
                label="Street Address"
                placeholder="House No., Building, Street"
                value={currentLoc.address.street}
                onChange={(e) => updateField("street", e.target.value)}
              />
            </div>
          </div>

          <div className="bq-add-form-actions">
            <BoutiqueButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(false)}
              disabled={locations.length === 0}
            >
              Cancel
            </BoutiqueButton>
            <BoutiqueButton type="button" size="sm" onClick={addLocation}>
              Save Facility
            </BoutiqueButton>
          </div>
        </div>
      )}

      <div className="bq-flow-actions">
        <BoutiqueButton
          type="button"
          variant="ghost"
          size="md"
          onClick={onBack}
          disabled={loading}
          style={{ flex: 1 }}
        >
          <ArrowLeft size={18} weight="bold" /> Back
        </BoutiqueButton>

        <BoutiqueButton
          type="button"
          size="md"
          onClick={onNext}
          loading={loading}
          style={{ flex: 2 }}
        >
          {locations.length === 0 ? "Skip for now" : "Complete Setup"}{" "}
          <ArrowRight size={18} weight="bold" />
        </BoutiqueButton>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-location-flow { display: flex; flex-direction: column; gap: 40px; width: 100%; }
        .bq-flow-header { margin-bottom: 8px; }
        .bq-flow-title { font-family: ${BQ_FONTS.heading}; font-size: 32px; font-weight: 800; color: ${BQ_COLORS.ink}; margin: 0; letter-spacing: -0.02em; }
        .bq-flow-desc { font-size: 16px; color: ${BQ_COLORS.inkMuted}; margin-top: 8px; font-weight: 500; opacity: 0.8; }

        .bq-loc-list { display: flex; flex-direction: column; gap: 12px; }
        .bq-loc-item {
            background: white; border: 1px solid ${BQ_COLORS.border}; border-radius: 20px;
            padding: 16px 24px; display: flex; align-items: center; justify-content: space-between;
            box-shadow: ${BQ_SHADOWS.soft};
        }
        .bq-loc-item-info { display: flex; align-items: center; gap: 16px; }
        .bq-loc-item-text { display: flex; flex-direction: column; }
        .bq-loc-item-city { font-weight: 700; font-size: 14px; color: ${BQ_COLORS.ink}; }
        .bq-loc-item-street { font-size: 12px; color: ${BQ_COLORS.inkMuted}; }
        .bq-loc-item-remove { background: none; border: none; color: ${BQ_COLORS.danger}; cursor: pointer; opacity: 0.4; transition: opacity 0.2s; }
        .bq-loc-item-remove:hover { opacity: 1; }

        .bq-add-another-btn {
            background: ${BQ_COLORS.bg}; border: 1px dashed ${BQ_COLORS.border}; border-radius: 20px;
            padding: 16px; color: ${BQ_COLORS.inkMuted}; font-family: ${BQ_FONTS.heading};
            font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center;
            justify-content: center; gap: 8px; transition: all 0.3s;
        }
        .bq-add-another-btn:hover { border-color: ${BQ_COLORS.accent}; color: ${BQ_COLORS.accent}; background: white; }

        .bq-loc-add-form { display: flex; flex-direction: column; gap: 24px; padding: 32px; background: ${BQ_COLORS.bgAlt}; border-radius: 28px; border: 1.5px solid ${BQ_COLORS.border}; }
        .bq-gps-hub { background: white; border: 1px solid ${BQ_COLORS.border}; border-radius: 16px; padding: 20px; box-shadow: ${BQ_SHADOWS.soft}; }
        .bq-hub-content { display: flex; align-items: center; justify-content: space-between; }
        .bq-hub-label { font-size: 9px; font-weight: 800; color: ${BQ_COLORS.accent}; text-transform: uppercase; letter-spacing: 0.1em; }
        .bq-hub-value { font-size: 16px; font-weight: 700; margin: 4px 0 0; }
        .bq-hub-error { margin-top: 12px; font-size: 12px; color: ${BQ_COLORS.danger}; font-weight: 700; display: flex; align-items: center; gap: 6px; }

        .bq-address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .bq-grid-full { grid-column: span 2; }
        .bq-add-form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }

        .bq-flow-actions { display: flex; align-items: center; gap: 16px; margin-top: 16px; padding-top: 32px; border-top: 1px solid ${BQ_COLORS.border}; }

        .bq-spin { animation: bq-spin 1s linear infinite; }
        @keyframes bq-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bq-slide-down { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `,
        }}
      />
    </div>
  );
}
