/**
 * Request browser geolocation. Does not map to a service area without a reverse-geo API.
 * @returns {Promise<{ lat: number, lng: number } | null>}
 */
export function requestDeviceCoordinates() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 }
    );
  });
}
