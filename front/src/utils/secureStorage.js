/**
 * Secure Storage Utility
 * Uses AES-GCM for encrypting/decrypting data stored in localStorage.
 * Note: This provides client-side obfuscation and basic protection.
 */

const ENCRYPTION_KEY_RAW = 'aeropulse_v1_secure_key_obfuscation'; // Project internal salt

/**
 * Derives a CryptoKey from a string
 */
async function getDerivedKey() {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(ENCRYPTION_KEY_RAW),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('aeropulse_salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Saves data encrypted to localStorage
 */
export async function saveEncrypted(key, data) {
  try {
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const cryptoKey = await getDerivedKey();

    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      enc.encode(JSON.stringify(data))
    );

    const encryptedArray = new Uint8Array(encryptedContent);
    const result = new Uint8Array(iv.length + encryptedArray.length);
    result.set(iv);
    result.set(encryptedArray, iv.length);

    const base64 = btoa(String.fromCharCode(...result));
    localStorage.setItem(key, base64);
  } catch (err) {
    console.error('Encryption failed', err);
    // Fallback to plain for local dev if crypto fails (optional, but safer to just fail)
  }
}

/**
 * Loads and decrypts data from localStorage
 */
export async function loadEncrypted(key) {
  try {
    const base64 = localStorage.getItem(key);
    if (!base64) return null;

    const combined = new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const cryptoKey = await getDerivedKey();
    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      data
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decryptedContent));
  } catch (err) {
    console.error('Decryption failed', err);
    return null;
  }
}

/**
 * Removes data
 */
export function removeEncrypted(key) {
  localStorage.removeItem(key);
}
