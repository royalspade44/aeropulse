/**
 * Validates profile fields for customer registration (step 1 / combined).
 * @param {Object} formData
 * @param {string} detectedRole
 * @returns {{ errors: Record<string, string>, valid: boolean }}
 */
export function validateRegistrationProfile(formData, detectedRole = 'customer') {
  const errors = {};

  if (!formData.firstName?.trim()) {
    errors.firstName = 'First name is required';
  } else if (formData.firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
    errors.firstName = 'First name can only contain letters';
  }

  if (!formData.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  } else if (formData.lastName.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
    errors.lastName = 'Last name can only contain letters';
  }

  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.alias?.trim()) {
    errors.alias = 'Preferred alias is required';
  } else if (formData.alias.trim().length < 2) {
    errors.alias = 'Alias must be at least 2 characters';
  } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.alias.trim())) {
    errors.alias = 'Alias may only use letters, numbers, dot, underscore, hyphen';
  }

  if (!formData.phone) {
    errors.phone = 'Phone number is required';
  } else {
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!/^[0-9]{10,11}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid phone number (10-11 digits)';
    } else if (!cleanPhone.startsWith('09') && !cleanPhone.startsWith('639')) {
      errors.phone = 'Please enter a valid Philippine mobile number (starts with 09 or 639)';
    }
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[a-z])/.test(formData.password)) {
    errors.password = 'Password must contain at least one lowercase letter';
  } else if (!/(?=.*[A-Z])/.test(formData.password)) {
    errors.password = 'Password must contain at least one uppercase letter';
  } else if (!/(?=.*\d)/.test(formData.password)) {
    errors.password = 'Password must contain at least one number';
  } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
    errors.password = 'Password must contain at least one special character (@$!%*?&)';
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!formData.agreeTermsWarranty) {
    errors.agreeTermsWarranty = 'Required';
  }
  if (!formData.agreeTermsService) {
    errors.agreeTermsService = 'Required';
  }
  if (!formData.agreeTermsApp) {
    errors.agreeTermsApp = 'Required';
  }
  if (!formData.agreePrivacyRa10173) {
    errors.agreePrivacyRa10173 = 'You must acknowledge the Data Privacy Act (RA 10173) disclosure';
  }

  if (!/^\d{6}$/.test(String(formData.emailOtp || '').trim())) {
    errors.emailOtp = 'Email one-time code must be exactly 6 digits';
  }

  if (!/^\d{6}$/.test(String(formData.totpCode || '').trim())) {
    errors.totpCode = 'Authenticator code must be exactly 6 digits';
  }

  if (!/^\d{6}$/.test(String(formData.smsCode || '').trim())) {
    errors.phoneOtp = 'SMS code must be exactly 6 digits';
  }

  if (detectedRole === 'customer' && !formData.address?.trim()) {
    errors.address = 'Billing address is required for customer accounts';
  }

  return { errors, valid: Object.keys(errors).length === 0 };
}

/**
 * Validates fields owned by the Profile & Security step.
 * @param {Object} formData
 * @returns {{ errors: Record<string, string>, valid: boolean }}
 */
export function validateProfileAndSecurityStep(formData) {
  const errors = {};

  if (!formData.firstName?.trim()) {
    errors.firstName = 'First name is required';
  } else if (formData.firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
    errors.firstName = 'First name can only contain letters';
  }

  if (!formData.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  } else if (formData.lastName.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
    errors.lastName = 'Last name can only contain letters';
  }

  if (!formData.alias?.trim()) {
    errors.alias = 'Preferred alias is required';
  } else if (formData.alias.trim().length < 2) {
    errors.alias = 'Alias must be at least 2 characters';
  } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.alias.trim())) {
    errors.alias = 'Alias may only use letters, numbers, dot, underscore, hyphen';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[a-z])/.test(formData.password)) {
    errors.password = 'Password must contain at least one lowercase letter';
  } else if (!/(?=.*[A-Z])/.test(formData.password)) {
    errors.password = 'Password must contain at least one uppercase letter';
  } else if (!/(?=.*\d)/.test(formData.password)) {
    errors.password = 'Password must contain at least one number';
  } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
    errors.password = 'Password must contain at least one special character (@$!%*?&)';
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return { errors, valid: Object.keys(errors).length === 0 };
}
