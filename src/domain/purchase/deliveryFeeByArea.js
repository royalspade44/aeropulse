/**
 * Delivery fee by service area (PHP). Tunable per business rules.
 * @param {string} areaId
 * @returns {number}
 */
export function getDeliveryFeeForArea(areaId) {
  const map = {
    cavite: 350,
    laguna: 400,
    bulacan: 380,
    pangasinan: 550,
    bataan: 420,
    ilocos: 600
  };
  return map[areaId] ?? 400;
}
