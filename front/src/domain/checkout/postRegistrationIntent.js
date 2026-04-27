const KEY = 'aeropulse_return_to_checkout';

export function setPostRegistrationCheckoutIntent() {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
}

export function consumePostRegistrationCheckoutIntent() {
  try {
    const v = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return v === '1';
  } catch {
    return false;
  }
}
