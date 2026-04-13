/**
 * Demo TOTP confirmation: accept fixed code after user copies the displayed secret.
 * @param {string} code
 * @returns {boolean}
 */
export function verifyTotpCodeStub(code) {
  return String(code).trim() === '000000';
}
