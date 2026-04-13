/**
 * @param {Object} unit
 * @returns {string[]} warning messages for warranty UI
 */
export function getWarrantyWarnings(unit) {
  const warnings = [];
  if (unit?.recommendedReplacement) {
    warnings.push('This unit is recommended for replacement.');
  }
  if (unit?.failedRepairsCount >= (unit?.failedRepairsThreshold || 3)) {
    warnings.push('Too many failed repair attempts in the policy window. Warranty may be limited.');
  }
  if (unit?.recallActive) {
    warnings.push('This model has an active recall. Contact support immediately.');
  }
  if (unit?.warrantyRevoked) {
    warnings.push('Warranty has been revoked (terms violation or manager action).');
  }
  return warnings;
}
