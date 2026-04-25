/**
 * Demo: SMS OTP is "654321".
 * @param {string} code
 * @returns {boolean}
 */
export function verifySmsOtpStub(code) {
  const normalized = String(code).trim();
  return /^\d{6}$/.test(normalized) && normalized === '654321';
}
