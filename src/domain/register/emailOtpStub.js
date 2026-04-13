/**
 * Demo: pretend email OTP is "123456" for any address.
 * @param {string} _email
 * @param {string} code
 * @returns {boolean}
 */
export function verifyEmailOtpStub(_email, code) {
  return String(code).trim() === '123456';
}
