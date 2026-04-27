/**
 * Preferred alias defaults to local-part of email.
 * @param {string} email
 * @returns {string}
 */
export function defaultAliasFromEmail(email) {
  if (!email || !email.includes('@')) return '';
  return email.split('@')[0].slice(0, 48);
}
