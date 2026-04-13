/**
 * Demo-only secret. Production must issue secrets server-side.
 * @returns {string}
 */
export function generateTotpSecretStub() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let s = '';
  for (let i = 0; i < 32; i += 1) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}
