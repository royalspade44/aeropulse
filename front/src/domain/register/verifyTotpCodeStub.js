/**
 * Demo TOTP confirmation: accept fixed code after user copies the displayed secret.
 * @param {string} code
 * @returns {boolean}
 */
export function verifyTotpCodeStub(code) {
  const normalized = String(code).trim();
  return /^\d{6}$/.test(normalized) && normalized === '000000';
}
