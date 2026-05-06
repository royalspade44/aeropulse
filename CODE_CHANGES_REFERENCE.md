# Code Changes Reference

## Overview
This document provides a concise reference to all modified files and their key changes.

---

## Backend Changes

### 1. backend/src/controllers/authController.js

#### Register Function
- **Removed**: All `OtpRequest.findOne()` checks (was blocking registration)
- **Added**: Field-level validation for email, name_first, name_last, phone, password, alias
- **Changed**: Returns `{ errors: { field: "message" } }` on validation failure instead of single error
- **Changed**: Maps `alias` parameter to `username` field in User model
- **Lines**: ~15-150

**Key Code**:
```javascript
// Old: blocked by OTP requirement
const otpRequest = await OtpRequest.findOne({ email: normalizedEmail });
if (!otpRequest) return res.status(400).json({ message: "Email not verified. Check your inbox." });

// New: no OTP gate, just field validation
const errors = {};
if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
  errors.email = "Invalid email format";
}
// ... more field validations ...
if (Object.keys(errors).length > 0) {
  return res.status(400).json({ errors });
}
```

#### Login Function
- **Added**: Field-level validation for email and password
- **Changed**: Returns `{ errors: { field: "message" } }` on validation failure
- **Lines**: ~200-320

**Key Code**:
```javascript
const errors = {};
if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
  errors.email = "Invalid email format";
}
if (!password) {
  errors.password = "Password is required";
}
if (Object.keys(errors).length > 0) {
  return res.status(400).json({ errors });
}
```

---

### 2. backend/src/controllers/userController.js

#### validateAddress Function
- **Before**: `return "error string"`
- **After**: `return { field: "error string" }` or null
- **Lines**: ~77-103

**Key Code**:
```javascript
// Old
const validateAddress = (address) => {
  if (!address.name) return "Recipient name is required.";
  // ... returns first error string found ...
  return "";
};

// New
const validateAddress = (address) => {
  const errors = {};
  if (!address.name) errors.name = "Recipient name is required";
  if (!address.phone || !/^09\d{9}$/.test(address.phone)) {
    errors.phone = "Phone number must be in format 09XXXXXXXXX";
  }
  // ... all field validations ...
  return Object.keys(errors).length > 0 ? errors : null;
};
```

#### addAddress Function
- **Changed**: Uses new validateAddress() return format
- **Changed**: Returns `{ errors: {...} }` instead of `{ message: "..." }`
- **Lines**: ~309-325

**Key Code**:
```javascript
// Old
const validationError = validateAddress(normalizedAddress);
if (validationError) {
  return res.status(400).json({ message: validationError });
}

// New
const validationErrors = validateAddress(normalizedAddress);
if (validationErrors) {
  return res.status(400).json({ errors: validationErrors });
}
```

#### updateAddress Function
- **Same changes as addAddress**
- **Lines**: ~327-357

---

## Frontend Changes (Web)

### 1. front/src/config/api.js

#### Error Handling Enhancement
- **Added**: Extract field errors from backend error response
- **Lines**: ~Error handling section

**Key Code**:
```javascript
// Old
throw new Error(message);

// New
const err = new Error(message);
err.status = response.status;
err.data = data;
err.fieldErrors = data?.errors && typeof data.errors === 'object' ? data.errors : null;
throw err;
```

---

### 2. front/src/components/login/Login.js

#### Error Handling in authenticateUser
- **Added**: Parse backend field errors
- **Changed**: Display field errors instead of generic alerts
- **Lines**: ~127-161

**Key Code**:
```javascript
// Old
} catch (err) {
  setErrors((prev) => ({ ...prev, password: err.message || 'Invalid credentials' }));
  alert(err.message || 'Invalid email or password!');
}

// New
} catch (err) {
  if (err?.status === 400 && err?.fieldErrors) {
    setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
    setAuthMessage(Object.values(err.fieldErrors)[0] || 'Please check your inputs');
  } else if (err?.status === 401) {
    setErrors((prev) => ({ ...prev, password: 'Invalid credentials' }));
    setAuthMessage('Email or password is incorrect');
  }
}
```

---

### 3. front/src/components/login/LoginForm.js

#### Pre-Submit Validation
- **Added**: Client-side validation before submit
- **Lines**: ~handleSubmit function

**Key Code**:
```javascript
const validateBeforeSubmit = () => {
  const newErrors = {};
  if (!email) newErrors.email = 'Email is required';
  if (!password) newErrors.password = 'Password is required';
  return newErrors;
};

const handleSubmit = (e) => {
  e.preventDefault();
  const validationErrors = validateBeforeSubmit();
  if (Object.keys(validationErrors).length > 0) {
    setErrors((prev) => ({ ...prev, ...validationErrors }));
    return;
  }
  onSubmit();
};
```

---

### 4. front/src/components/register/Register.js

#### Error Handling in Submit
- **Added**: Parse backend field errors
- **Changed**: Merge backend errors into form state
- **Lines**: ~211-225

**Key Code**:
```javascript
// Old
} catch (err) {
  setErrors((prev) => ({ ...prev, email: err.message }));
  alert(`Registration failed: ${err.message || 'Please try again.'}`);
}

// New
} catch (err) {
  if (err?.fieldErrors && typeof err.fieldErrors === 'object') {
    setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
    const firstError = Object.values(err.fieldErrors)[0];
    alert(`Registration failed: ${firstError || err.message || '...'}`);
  } else {
    setErrors((prev) => ({ ...prev, email: err.message }));
    alert(`Registration failed: ${err.message || 'Please try again.'}`);
  }
}
```

---

### 5. front/src/components/checkout/Checkout.js

#### handleSaveAddress Function
- **Added**: Graceful handling of backend field errors
- **Changed**: Modal stays open on error; errors handled in modal component
- **Lines**: ~173-200

**Key Code**:
```javascript
// Old
} catch (error) {
  alert(error?.message || 'Unable to save address right now.');
}

// New
} catch (error) {
  if (error?.fieldErrors) {
    console.error('Address validation errors:', error.fieldErrors);
    // Modal component handles displaying errors
  } else {
    alert(error?.message || 'Unable to save address right now.');
  }
}
```

---

### 6. front/src/components/checkout/AddAddressModal.js

#### State and Props
- **Added**: `backendErrors` prop (optional)
- **Added**: `serverMessage` state for inline error display
- **Lines**: ~36-60

**Key Code**:
```javascript
const [serverMessage, setServerMessage] = useState('');

// In render
{serverMessage && (
  <div className="form-error-message" style={{ color: '#d32f2f' }}>
    {serverMessage}
  </div>
)}
```

#### handleSubmit Function
- **Changed**: Sets serverMessage on validation error instead of alert
- **Changed**: Modal stays open; doesn't auto-close on error
- **Lines**: ~handleSubmit

**Key Code**:
```javascript
// Old
const errors = validateAddress(normalized);
if (errors.length > 0) {
  alert(errors[0]);
  return;
}

// New
const errors = validateAddress(normalized);
if (errors.length > 0) {
  setServerMessage(errors[0]);
  return;
}
setServerMessage('');
onSave(normalized);
```

---

## Frontend Changes (Mobile - If Applicable)

### bork5/caact-mobile/services/api.jsx
- Should be updated to handle `{ errors: {...} }` response format
- `register()` and `login()` functions may need to parse fieldErrors

---

## Configuration Files Modified

None - No config file changes required

---

## Model Files Modified

**backend/src/models/User.js**: 
- Verified correct (username field with unique index, no changes needed)

---

## Middleware Files Modified

**backend/src/middleware/auth.js**:
- Verified correct (JWT verification unchanged, no changes needed)

---

## Summary of Changes by Impact

### High Impact (User-Facing)
1. Register endpoint no longer gates on OTP
2. Error messages now field-specific instead of generic
3. Modals stay open on validation error
4. Login form shows field errors instead of alerts

### Medium Impact (Integration)
1. API response format changed from `{ message: "..." }` to `{ errors: {...} }`
2. Phone number formatting standardized to 09XXXXXXXXX
3. Session logout now event-driven (faster, more reliable)

### Low Impact (Internal)
1. Alias parameter mapped to username field (internal only)
2. Validateaddress function now returns object instead of string
3. Error handling consolidated into error.fieldErrors property

---

## Files NOT Modified (But Reviewed)

- `backend/src/middleware/auth.js` - Correct, no changes needed
- `backend/src/models/User.js` - Correct structure, no changes needed
- `backend/src/routes/*.js` - Endpoints unchanged, controllers updated
- `front/src/domain/register/validateRegistrationProfile.js` - Already comprehensive, no changes needed
- `front/src/context/UserContext.js` - Already has logout listener, no changes needed (previous session)

---

## Line Number References

| File | Section | Lines | Change Type |
|------|---------|-------|------------|
| authController.js | register | 15-150 | Major refactor |
| authController.js | login | 200-320 | New validation |
| userController.js | validateAddress | 77-103 | Signature change |
| userController.js | addAddress | 309-325 | Error format |
| userController.js | updateAddress | 327-357 | Error format |
| api.js | error handling | ~50-70 | Enhancement |
| Login.js | authenticateUser | 127-161 | Error handling |
| LoginForm.js | handleSubmit | ~60-70 | Validation added |
| Register.js | submit catch | 211-225 | Error parsing |
| Checkout.js | handleSaveAddress | 173-200 | Error handling |
| AddAddressModal.js | component | 40-200 | Error display |

---

## Backward Compatibility

⚠️ **Breaking Changes**:
- API response format changed from `{ message: "..." }` to `{ errors: {...} }`
- Mobile clients and external integrations need updates

✅ **Backward Compatible**:
- User model structure unchanged
- Authentication flow conceptually same (just faster with OTP removed)
- Session storage keys unchanged (accessToken, activeAccountSession)

---

## Testing Coverage

- Register endpoint: ✅ Tested (field validation)
- Login endpoint: ✅ Tested (field validation)
- Address endpoints: ✅ Tested (field-level errors)
- Frontend parsing: ✅ Tested (error display)
- Session isolation: ✅ Tested (401 logout event)
- Client-side validation: ✅ Tested (prevents unnecessary calls)

---

## Deployment Checklist

- [x] Code changes complete
- [x] Backend syntax verified
- [x] Frontend builds verified
- [x] Error response format documented
- [x] Test scenarios documented
- [ ] Staging environment testing
- [ ] UAT sign-off
- [ ] Production deployment
