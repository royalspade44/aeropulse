const KEY = 'aeropulse_service_area_id';

export function getStoredServiceAreaId() {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredServiceAreaId(areaId) {
  try {
    localStorage.setItem(KEY, areaId);
  } catch {
    /* ignore */
  }
}
