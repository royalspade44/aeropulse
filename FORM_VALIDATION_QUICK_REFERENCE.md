# Quick Reference: Form Validation System

## Error Response Format

### Validation Error (400)
```json
{
  "errors": {
    "fieldName": "Human-readable error message"
  }
}
```

### Authentication Error (401)
```json
{
  "message": "Invalid credentials"
}
```

## Validation Rules by Endpoint

### POST /auth/register
**Required Fields**: email, name_first, name_last, phone, password, alias, billingAddress (if customer)

**Validation**:
| Field | Rule | Error |
|-------|------|-------|
| email | RFC pattern | "Invalid email format" |
| name_first | 2-80 chars, letters only | "..." |
| name_last | 2-80 chars, letters only | "..." |
| phone | 09XXXXXXXXX or 639XXXXXXXXX | "Phone number must be in format 09XXXXXXXXX" |
| password | 8+ chars, uppercase, lowercase, digit, special (@$!%*?&) | "Password must contain..." |
| alias | 2-30 chars, alphanumeric + underscore/dot/hyphen | "Alias must be 2-30 chars..." |
| billingAddress (customer only) | All sub-fields required | "Region is required", etc. |

### POST /auth/login
| Field | Rule | Error |
|-------|------|-------|
| email | RFC pattern or exists check | "Invalid email format" |
| password | Not empty | "Password is required" |

### POST /users/addresses
| Field | Rule | Error |
|-------|------|-------|
| name | Not empty, trimmed | "Recipient name is required" |
| region | Not empty, trimmed | "Region is required" |
| province | Not empty, trimmed | "Province is required" |
| city | Not empty, trimmed | "City is required" |
| barangay | Not empty, trimmed | "Barangay is required" |
| street | Not empty, trimmed | "Street address is required" |
| phone | 09XXXXXXXXX format | "Phone number must be in format 09XXXXXXXXX" |
| postalCode | 4 digits if provided | "Postal code must be exactly 4 digits" |

## Frontend Error Handling

### Login Form
```javascript
try {
  await login(email, password);
} catch (err) {
  if (err?.fieldErrors) {
    // { email: "Invalid email...", password: "..." }
    setErrors(err.fieldErrors);
  }
}
```

### Register Form
```javascript
try {
  await register(formData);
} catch (err) {
  if (err?.fieldErrors) {
    setErrors(prev => ({ ...prev, ...err.fieldErrors }));
  }
}
```

### Address Modal
```javascript
try {
  await saveAddress(addressData);
} catch (err) {
  if (err?.fieldErrors) {
    // Show errors in modal (don't close)
    setServerMessage(Object.values(err.fieldErrors)[0]);
  }
}
```

## Phone Number Normalization

```javascript
// Input: "0917-123-4567" or "09171234567" or "639171234567"
// Output: "09171234567"

const normalizePhone = (phone) => {
  const digits = phone.replace(/\D/g, '');
  if (/^639\d{9}$/.test(digits)) {
    return `09${digits.slice(3)}`;
  }
  return digits;
};
```

## Session Management

### On 401 Response
```javascript
// Backend (middleware/auth.js)
// Returns 401 if token invalid/expired

// Frontend (api.js)
if (response.status === 401) {
  localStorage.clear(); // Clear all stored data
  window.dispatchEvent(new CustomEvent("auth:logout"));
}

// UserContext listener
window.addEventListener("auth:logout", () => {
  setUser(null);
  setUserRole(null);
  setCurrentSession(null);
  setIsAuthenticated(false);
});
```

## Client-Side Validation Examples

### Email
```javascript
const isValidEmail = (email) => 
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
```

### Phone
```javascript
const isValidPhone = (phone) => {
  const digits = phone.replace(/\D/g, '');
  return /^09\d{9}$/.test(digits) || /^639\d{9}$/.test(digits);
};
```

### Password
```javascript
const isStrongPassword = (password) => {
  return password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[@$!%*?&]/.test(password);
};
```

### Alias
```javascript
const isValidAlias = (alias) => 
  /^[a-zA-Z0-9_.-]{2,30}$/.test(alias);
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Backend error not displaying" | Response format mismatch | Check backend returns `{ errors: {...} }` |
| "Modal closes with error" | Old code path | Use `handleSaveAddress` that checks for fieldErrors |
| "Phone not accepted" | Format mismatch | Ensure canonicalized to 09XXXXXXXXX |
| "401 logout delayed" | Not using event listener | Ensure UserContext has "auth:logout" listener |
| "Duplicate alias allowed" | No uniqueness check | Backend should check User collection for existing username |

## Testing Checklist

- [ ] Register → invalid email → error shown (no API call)
- [ ] Register → weak password → error shown (no API call)
- [ ] Login → wrong credentials → field error shown
- [ ] Add address → invalid phone → modal stays open, shows error
- [ ] Logout in tab 1 → refresh tab 2 → shows login (user cleared)
- [ ] Register → no OTP steps → instant account creation
- [ ] Frontend builds without errors
- [ ] Backend syntax check passes

## Debug Tips

1. **Check error structure**:
   ```javascript
   console.log(error?.fieldErrors); // Should be object, not string
   ```

2. **Inspect localStorage**:
   ```javascript
   localStorage.getItem('accessToken'); // Should have JWT or be null
   localStorage.getItem('activeAccountSession'); // Should have user ID
   ```

3. **Watch network tab**:
   - Registration POST should receive 400 with `{ errors: {...} }` on invalid input
   - Successful registration returns 201 with user object

4. **Check browser events**:
   ```javascript
   window.addEventListener('auth:logout', (e) => console.log('Logout event', e.detail));
   ```

## References
- Full implementation details: `FORM_VALIDATION_IMPLEMENTATION_COMPLETE.md`
- Smoke test scenarios: `FORM_VALIDATION_SMOKE_TESTS.md`
- Implementation summary: `IMPLEMENTATION_SUMMARY.md`
