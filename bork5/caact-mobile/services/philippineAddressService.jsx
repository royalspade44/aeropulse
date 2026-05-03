import AsyncStorage from "@react-native-async-storage/async-storage";

const PSGC_BASE_URL = "https://psgc.gitlab.io/api";
const MUNICIPALITIES_CACHE_KEY = "psgc_cities_municipalities_v1";
const BARANGAYS_CACHE_PREFIX = "psgc_barangays_v1";

const FALLBACK_LOCALITIES = [
  { code: "137602000", name: "City of Manila", displayName: "City of Manila" },
  { code: "137404000", name: "Quezon City", displayName: "Quezon City" },
  { code: "137401000", name: "Caloocan City", displayName: "Caloocan City" },
  { code: "137403000", name: "Makati City", displayName: "Makati City" },
  { code: "137605000", name: "Pasig City", displayName: "Pasig City" },
  { code: "072217000", name: "Cebu City", displayName: "Cebu City" },
  { code: "112402000", name: "Davao City", displayName: "Davao City" },
];

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeLocality(item = {}) {
  const type = item.isCity ? "City" : item.isMunicipality ? "Municipality" : "";
  const displayName = [item.name, type].filter(Boolean).join(" - ");

  return {
    code: item.code,
    name: item.name || "",
    displayName: displayName || item.name || "",
    provinceCode: item.provinceCode || "",
    regionCode: item.regionCode || "",
    isCity: !!item.isCity,
    isMunicipality: !!item.isMunicipality,
  };
}

function normalizeBarangay(item = {}) {
  return {
    code: item.code,
    name: item.name || "",
    displayName: item.name || "",
    cityCode: item.cityCode || "",
    municipalityCode: item.municipalityCode || "",
  };
}

async function readCache(key, fallback = []) {
  const raw = await AsyncStorage.getItem(key);
  const parsed = safeParse(raw, fallback);
  return Array.isArray(parsed) ? parsed : fallback;
}

async function writeCache(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getPhilippineLocalities() {
  const cached = await readCache(MUNICIPALITIES_CACHE_KEY);
  if (cached.length > 0) return cached;

  try {
    const response = await fetch(`${PSGC_BASE_URL}/cities-municipalities/`);
    if (!response.ok) throw new Error("Unable to load PSGC localities.");
    const data = await response.json();
    const localities = Array.isArray(data)
      ? data
          .map(normalizeLocality)
          .filter((item) => item.code && item.name)
          .sort((a, b) => a.displayName.localeCompare(b.displayName))
      : [];

    if (localities.length > 0) {
      await writeCache(MUNICIPALITIES_CACHE_KEY, localities);
      return localities;
    }
  } catch {}

  return FALLBACK_LOCALITIES;
}

export async function getBarangaysByLocality(localityCode) {
  if (!localityCode) return [];

  const cacheKey = `${BARANGAYS_CACHE_PREFIX}_${localityCode}`;
  const cached = await readCache(cacheKey);
  if (cached.length > 0) return cached;

  try {
    const response = await fetch(
      `${PSGC_BASE_URL}/cities-municipalities/${localityCode}/barangays/`,
    );
    if (!response.ok) throw new Error("Unable to load PSGC barangays.");
    const data = await response.json();
    const barangays = Array.isArray(data)
      ? data
          .map(normalizeBarangay)
          .filter((item) => item.code && item.name)
          .sort((a, b) => a.displayName.localeCompare(b.displayName))
      : [];

    if (barangays.length > 0) {
      await writeCache(cacheKey, barangays);
      return barangays;
    }
  } catch {}

  return [];
}
