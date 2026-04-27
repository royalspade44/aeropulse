/** Service / delivery regions for store purchasing (customer flow). */
export const SERVICE_AREAS = [
  { id: 'cavite', label: 'Cavite' },
  { id: 'laguna', label: 'Laguna' },
  { id: 'bulacan', label: 'Bulacan' },
  { id: 'pangasinan', label: 'Pangasinan' },
  { id: 'bataan', label: 'Bataan' },
  { id: 'ilocos', label: 'Ilocos' }
];

export const DEFAULT_SERVICE_AREA_ID = 'cavite';

export function getServiceAreaById(id) {
  return SERVICE_AREAS.find((a) => a.id === id) || SERVICE_AREAS[0];
}
