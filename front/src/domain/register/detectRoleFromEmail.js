export function detectRoleFromEmail(email = '') {
  const normalizedEmail = String(email).trim().toLowerCase();

  if (normalizedEmail.includes('superadmin')) return 'superadmin';
  if (normalizedEmail.includes('admin')) return 'admin';
  return 'customer';
}

export function getRoleLabel(role) {
  if (role === 'superadmin') return 'Super Admin';
  if (role === 'admin') return 'Admin';
  if (role === 'technician') return 'Tech';
  return 'Customer';
}