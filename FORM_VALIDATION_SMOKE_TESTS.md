# Form Validation & Error Handling Smoke Tests

## Overview
This document verifies that the complete authentication and validation system works end-to-end, with proper field-level error handling on both backend and frontend.

## Test Categories

### 1. BACKEND FIELD-LEVEL VALIDATION

#### Test 1.1: Register Endpoint - Email Validation
**Endpoint**: POST /auth/register  
**Payload**:
```json
{
  "email": "invalid-email",
  "name_first": "John",
  "name_last": "Doe",
  "phone": "09171234567",
  "password": "StrongPass123!",
  "alias": "johndoe"
}
```
**Expected Response**:
- Status: 400
- Body: `{ "errors": { "email": "Invalid email format" } }`
- Should NOT show alert; form should highlight email field only

#### Test 1.2: Register Endpoint - Phone Validation
**Endpoint**: POST /auth/register  
**Payload**:
```json
{
  "email": "john@example.com",
  "name_first": "John",
  "name_last": "Doe",
  "phone": "12345678",
  "password": "StrongPass123!",
  "alias": "johndoe"
}
```
**Expected Response**:
- Status: 400
- Body: `{ "errors": { "phone": "Phone number must be in format 09XXXXXXXXX" } }`

#### Test 1.3: Register Endpoint - Password Validation
**Endpoint**: POST /auth/register  
**Payload**:
```json
{
  "email": "john@example.com",
  "name_first": "John",
  "name_last": "Doe",
  "phone": "09171234567",
  "password": "weak",
  "alias": "johndoe"
}
```
**Expected Response**:
- Status: 400
- Body should contain field error for password (too short, missing uppercase/special chars, etc.)

#### Test 1.4: Register Endpoint - Alias Validation
**Endpoint**: POST /auth/register  
**Payload**:
```json
{
  "email": "john@example.com",
  "name_first": "John",
  "name_last": "Doe",
  "phone": "09171234567",
  "password": "StrongPass123!",
  "alias": "j"
}
```
**Expected Response**:
- Status: 400
- Body: `{ "errors": { "alias": "Alias must be 2-30 chars and can only contain letters, numbers, _, ., -" } }`

#### Test 1.5: Register Endpoint - Multiple Field Errors
**Endpoint**: POST /auth/register  
**Payload**:
```json
{
  "email": "bad-email",
  "name_first": "John",
  "name_last": "Doe",
  "phone": "123",
  "password": "weak",
  "alias": "x"
}
```
**Expected Response**:
- Status: 400
- Body: `{ "errors": { "email": "...", "phone": "...", "password": "...", "alias": "..." } }`
- All field errors should be included, not just first one

#### Test 1.6: Login Endpoint - Email/Password Validation
**Endpoint**: POST /auth/login  
**Payload**:
```json
{
  "email": "not-an-email",
  "password": "test"
}
```
**Expected Response**:
- Status: 400
- Body: `{ "errors": { "email": "Invalid email format", "password": "..." } }`

#### Test 1.7: Address Add - Missing Required Fields
**Endpoint**: POST /users/addresses  
**Payload**:
```json
{
  "name": "",
  "region": "",
  "phone": ""
}
```
**Expected Response**:
- Status: 400
- Body: `{ "errors": { "name": "Recipient name is required", "region": "Region is required", "phone": "Phone number is required", ... } }`

#### Test 1.8: Address Add - Invalid Phone Format
**Endpoint**: POST /users/addresses  
**Payload**:
```json
{
  "name": "John Doe",
  "region": "CALABARZON",
  "province": "Laguna",
  "city": "Cabuyao",
  "barangay": "Banlic",
  "street": "123 Main St",
  "phone": "1234567"
}
```
**Expected Response**:
- Status: 400
- Body: `{ "errors": { "phone": "Phone number must be in format 09XXXXXXXXX" } }`

#### Test 1.9: Address Add - Invalid Postal Code
**Endpoint**: POST /users/addresses  
**Payload**:
```json
{
  "name": "John Doe",
  "region": "CALABARZON",
  "province": "Laguna",
  "city": "Cabuyao",
  "barangay": "Banlic",
  "street": "123 Main St",
  "phone": "09171234567",
  "postalCode": "12345"
}
```
**Expected Response**:
- Status: 400
- Body: `{ "errors": { "postalCode": "Postal code must be exactly 4 digits" } }`

---

### 2. FRONTEND ERROR DISPLAY & PARSING

#### Test 2.1: Login Form - Display Backend Email Error
**Steps**:
1. Navigate to /login
2. Enter invalid email format (e.g., "notanemail")
3. Enter password
4. Click Sign In
5. Backend returns: `{ "errors": { "email": "Invalid email format" } }`
**Expected**:
- Email field shows error border/color
- Error message "Invalid email format" appears below email field
- No generic alert; specific field error only
- Password field remains clear

#### Test 2.2: Register Form - Display Multiple Field Errors
**Steps**:
1. Navigate to /register
2. Step through to Profile & Security
3. Leave required fields empty; enter weak password
4. Click Continue
5. Backend returns multiple field errors
**Expected**:
- Each field with error shows highlight + error message
- First error message displays in toast/alert with specific field name
- User can correct individual fields without full re-submission

#### Test 2.3: Address Modal - Backend Phone Error
**Steps**:
1. Navigate to checkout
2. Click "Add New Address"
3. Fill all fields with valid values
4. Enter invalid phone (e.g., "123456")
5. Click Save
6. Backend returns: `{ "errors": { "phone": "Phone number must be in format 09XXXXXXXXX" } }`
**Expected**:
- Modal stays open (does NOT close)
- Error message displays in modal (not alert)
- Phone field is highlighted
- User can correct and resubmit

#### Test 2.4: Client-Side Validation - Email Format
**Steps**:
1. Navigate to /register
2. On Email step, enter "invalidemail"
3. Click Continue
**Expected**:
- ERROR shows BEFORE backend call: "Please enter a valid email address"
- No API request sent
- User corrects and retries

#### Test 2.5: Client-Side Validation - Phone Format
**Steps**:
1. Navigate to /register
2. On Phone step, enter "123456789" (wrong format)
3. Try to continue
**Expected**:
- ERROR shows: "Please enter a valid Philippine mobile number (starts with 09 or 639)"
- No API request sent

#### Test 2.6: Client-Side Validation - Password Strength
**Steps**:
1. Navigate to /register
2. On Profile & Security, enter password "weak"
3. Try to continue
**Expected**:
- ERROR shows: "Password must be at least 8 characters" (or missing uppercase/special char)
- No API request sent
- User corrects to "StrongPass123!" and continues

---

### 3. AUTHENTICATION & SESSION ISOLATION

#### Test 3.1: Token Not Lost After 401
**Steps**:
1. Login successfully → token stored in localStorage["accessToken"]
2. Open DevTools → Application → localStorage
3. Verify token is present (should be JWT)
4. Make API call with expired/invalid token manually (clear token, set fake one)
5. Trigger API call → receive 401
**Expected**:
- 401 response broadcasts "auth:logout" event
- UserContext listener clears user state immediately
- localStorage cleared (accessToken removed)
- Next page load shows login screen (NOT random user)

#### Test 3.2: Concurrent Tab Session Isolation
**Steps**:
1. Tab A: Login as user1 → activeAccountSession=user1
2. Tab B: Login as user2 → activeAccountSession=user2
3. Tab A: Refresh page
4. Tab B: Refresh page
**Expected**:
- Tab A shows user1 dashboard
- Tab B shows user2 dashboard
- NO cross-contamination
- Different activeAccountSession per tab

#### Test 3.3: Address List Loads Per User
**Steps**:
1. Login as customer1
2. Go to Checkout → load addresses (GET /users/addresses)
3. Logout
4. Login as customer2
5. Go to Checkout → load addresses
**Expected**:
- Customer1 sees only their addresses
- Customer2 sees only their addresses
- req.authUser._id used to filter (not role-based)

---

### 4. REGISTRATION FLOW (NO OTP)

#### Test 4.1: Complete Registration Without OTP
**Steps**:
1. Navigate to /register
2. Legal step: agree to all T&C
3. Email step: enter valid email, continue
4. Profile step: enter name, alias (should auto-populate from email)
5. Phone step: enter phone (no OTP); for customer: enter billing address
6. Password step: enter strong password + 6-digit TOTP code (use demo: 000000)
7. Click Register
**Expected**:
- Backend creates user with email/username/phone/addresses
- NO OtpRequest record needed
- Backend returns success (no token in response)
- Frontend shows: "Registration successful! Please sign in to continue."
- Redirects to /login
- User can then login with email + password

#### Test 4.2: Registration Field Validation (Backend Catches)
**Steps**:
1. Navigate to /register
2. Fill most fields correctly but leave alias blank
3. Submit
**Expected**:
- Backend returns 400: `{ "errors": { "alias": "..." } }`
- Frontend shows error in registration form (NOT alert dismissal)
- User can correct alias and resubmit

#### Test 4.3: Customer Billing Address Required
**Steps**:
1. Navigate to /register as customer (no techician/admin email)
2. Go through steps
3. On Phone step: leave region/province/city/barangay/street empty
4. Try to continue
**Expected**:
- Client-side validation catches: "Region is required", "Province is required", etc.
- If somehow submitted to backend, backend returns field errors for address fields
- Address modal (checkout) also enforces same validation

---

### 5. CHECKOUT FLOW

#### Test 5.1: Add Address - Full Validation Flow
**Steps**:
1. Login as customer
2. Add items to cart
3. Go to checkout
4. Click "Add New Address"
5. Fill some fields, leave others empty (e.g., no phone)
6. Click "Save Address"
**Expected**:
- Client-side validation: shows error "Phone number is required"
- Modal stays open
- User fills phone: "09171234567"
7. Click Save again
8. Address saves
**Expected**:
- Modal closes
- Address appears in list
- Modal can be opened again for next address

#### Test 5.2: Update Address - Backend Validation
**Steps**:
1. Login as customer with saved address
2. Go to checkout
3. Click Edit on an address
4. Modal opens pre-filled
5. Change phone to "invalid"
6. Click Save
**Expected**:
- Backend returns 400: `{ "errors": { "phone": "Phone number must be in format..." } }`
- Modal shows error message (not alert)
- Address does NOT update
- User corrects phone and saves again

#### Test 5.3: Checkout With No Addresses
**Steps**:
1. New customer (no addresses)
2. Add items to cart
3. Go to checkout
**Expected**:
- Address list is empty
- "Add New Address" button is visible/enabled
- User clicks it, adds address, can proceed to payment

---

### 6. ACCOUNT SECURITY

#### Test 6.1: Duplicate Username Prevention
**Steps**:
1. Register user1 with alias "johndoe"
2. Logout
3. Register user2, try alias "johndoe" (same)
4. Submit
**Expected**:
- Backend returns 409 or 400: `{ "errors": { "alias": "Username is already taken" } }` (or similar)
- Frontend shows error
- User must choose different alias

#### Test 6.2: Duplicate Phone Prevention
**Steps**:
1. Register user1 with phone "09171234567"
2. Login as user2
3. Add address with phone "09171234567"
4. Save
**Expected**:
- Backend returns 409 or 400 if phone is globally unique constraint
- Frontend shows error
- Address NOT saved

---

## Quick Checklist

- [ ] Backend: All 4 auth endpoints return field-level errors (register, login, OTP removed)
- [ ] Backend: Address add/update return field-level errors
- [ ] Frontend: Login form displays backend field errors per field
- [ ] Frontend: Register form displays backend field errors per field
- [ ] Frontend: Address modal displays backend errors without closing
- [ ] Frontend: Client-side validation catches errors before API calls
- [ ] Frontend: Email validation matches backend regex
- [ ] Frontend: Phone validation matches backend (09XXXXXXXXX or 639XXXXXXXXX)
- [ ] Frontend: Password validation matches backend (8+, upper, lower, digit, special)
- [ ] Frontend: Alias validation matches backend (2-30, alphanumeric+_.-) 
- [ ] Session: 401 responses force logout + clear state
- [ ] Session: Token persists correctly in localStorage/AsyncStorage
- [ ] Session: No random account switching
- [ ] Registration: Works without OTP for all roles
- [ ] Registration: Customers required to provide billing address
- [ ] Checkout: Address validation enforced on add/edit
- [ ] Build: Frontend compiles without errors
- [ ] Build: Backend syntax check passes

---

## Notes
- Ensure Node.js backend is running during tests
- Use Postman/Thunder Client for direct API testing if needed
- Mobile smoke tests should mirror web (register, login, addresses)
- TOTP code for demo: use 000000 after scanning secret
