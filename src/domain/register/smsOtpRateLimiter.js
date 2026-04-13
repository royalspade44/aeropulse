const KEY = 'aeropulse_sms_otp_attempts';
const WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 2;

function readAttempts() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { timestamps: [] };
  } catch {
    return { timestamps: [] };
  }
}

function writeAttempts(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

/**
 * Carrier-based SMS OTP: max 2 attempts per rolling hour (client-side stub).
 * @returns {{ allowed: boolean, remainingAfterWindow?: number, retryAfterMs?: number }}
 */
export function canSendSmsOtp() {
  const now = Date.now();
  const data = readAttempts();
  const recent = (data.timestamps || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    const oldest = Math.min(...recent);
    return { allowed: false, retryAfterMs: WINDOW_MS - (now - oldest) };
  }
  return { allowed: true, remainingAfterWindow: MAX_ATTEMPTS - recent.length };
}

export function recordSmsOtpAttempt() {
  const now = Date.now();
  const data = readAttempts();
  const recent = (data.timestamps || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  writeAttempts({ timestamps: recent });
}
