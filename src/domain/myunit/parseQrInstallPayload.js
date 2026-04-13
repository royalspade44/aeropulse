/**
 * Parse technician QR payload (demo: JSON string).
 * @param {string} raw
 * @returns {{ ok: boolean, data?: Object, error?: string }}
 */
export function parseQrInstallPayload(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return { ok: false, error: 'Empty QR payload' };
  try {
    const data = JSON.parse(trimmed);
    if (!data.serialNumber && !data.serial) {
      return { ok: false, error: 'Missing serial number in payload' };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: 'Invalid QR data (expected JSON)' };
  }
}
