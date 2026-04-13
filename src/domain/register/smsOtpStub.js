/**
 * Demo: SMS OTP is "654321".
 * @param {string} code
 * @returns {boolean}
 */
export function verifySmsOtpStub(code) {
  return String(code).trim() === '654321';
}
