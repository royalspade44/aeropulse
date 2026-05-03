// services/locationService.jsx
import * as Location from "expo-location";

const CODE_ALPHABET = "23456789CFGHJMPQRVWX";
const PAIR_RESOLUTIONS = [20, 1, 0.05, 0.0025, 0.000125];

function clipLatitude(latitude) {
  return Math.min(90, Math.max(-90, Number(latitude || 0)));
}

function normalizeLongitude(longitude) {
  let value = Number(longitude || 0);
  while (value < -180) value += 360;
  while (value >= 180) value -= 360;
  return value;
}

export function encodePlusCode(latitude, longitude) {
  let lat = clipLatitude(latitude);
  let lng = normalizeLongitude(longitude);

  if (lat === 90) {
    lat = lat - 0.000000001;
  }

  let adjustedLat = lat + 90;
  let adjustedLng = lng + 180;

  let code = "";

  for (let i = 0; i < PAIR_RESOLUTIONS.length; i += 1) {
    const resolution = PAIR_RESOLUTIONS[i];

    const latDigit = Math.floor(adjustedLat / resolution);
    const lngDigit = Math.floor(adjustedLng / resolution);

    code += CODE_ALPHABET[Math.max(0, Math.min(CODE_ALPHABET.length - 1, latDigit))];
    code += CODE_ALPHABET[Math.max(0, Math.min(CODE_ALPHABET.length - 1, lngDigit))];

    adjustedLat -= latDigit * resolution;
    adjustedLng -= lngDigit * resolution;

    if (code.length === 8) {
      code += "+";
    }
  }

  return code;
}

export function buildDisplayAddress({ resolvedAddress = "", plusCode = "" }) {
  const cleanAddress = String(resolvedAddress || "").trim();
  const cleanPlusCode = String(plusCode || "").trim();

  if (cleanAddress && cleanPlusCode) {
    return `${cleanAddress} • ${cleanPlusCode}`;
  }

  if (cleanAddress) {
    return cleanAddress;
  }

  if (cleanPlusCode) {
    return cleanPlusCode;
  }

  return "";
}

export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function getCurrentLocationSnapshot() {
  const granted = await requestLocationPermission();

  if (!granted) {
    throw new Error("Location permission was not granted.");
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const latitude = Number(position?.coords?.latitude || 0);
  const longitude = Number(position?.coords?.longitude || 0);

  let resolvedAddress = "";

  try {
    const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (Array.isArray(reverse) && reverse.length > 0) {
      const first = reverse[0];
      resolvedAddress = [
        first.name,
        first.street,
        first.subregion,
        first.city,
        first.region,
      ]
        .filter(Boolean)
        .join(", ");
    }
  } catch (error) {
    console.error("Reverse geocode failed:", error);
  }

  const plusCode = encodePlusCode(latitude, longitude);
  const displayAddress = buildDisplayAddress({
    resolvedAddress,
    plusCode,
  });

  return {
    latitude,
    longitude,
    plusCode,
    resolvedAddress,
    displayAddress,
  };
}