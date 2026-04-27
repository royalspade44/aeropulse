/**
 * Demo: pretend email OTP is "123456" for any address.
 * @param {string} _email
 * @param {string} code
 * @returns {boolean}
 */
export function verifyEmailOtpStub(_email, code) {
  const normalized = String(code).trim();
  return /^\d{6}$/.test(normalized) && normalized === '123456';
}
