# AeroPulse Admin System - Integration Test Guide

## System Overview
The inventory management system has been fully integrated with role-based workflows:
- **Managers (admin role)**: Submit change requests, receive restock deliveries
- **Owners (superadmin role)**: Review & approve requests, create restock orders

---

## Testing Prerequisites

### Backend Should Be Running
```bash
cd backend
npm start
# Should output: MongoDB connected, Server running on port 5000
```

### Frontend Should Be Running  
```bash
cd front
npm start
# Should open http://localhost:3000
```

### Test Accounts Available
- **Owner Account**: superadmin role
- **Manager Account**: admin role
- **Branch**: Bulacan (default in demo data)

---

## Test Scenario 1: Manager Requests Stock Change

### Steps
1. **Login as Manager** (admin role)
   - Open `/admin/inventory`
   - Should see **orange toolbar buttons**: "📋 Pending Approvals" and "📦 Incoming Restock"
   
2. **Verify Branch Filter**
   - See dropdown "Filter by Branch" set to active branch
   - Try selecting different branches - product list should update
   
3. **Open Change Request Modal**
   - Click "Request Change" button on any product
   - Modal should display:
     - Product name and SKU (read-only)
     - Current stock (read-only, shown from branch-specific stock)
     - Requested New Stock (editable number input)
     - Reason for Change (editable textarea)
   
4. **Submit Request**
   - Enter desired quantity (e.g., 50)
   - Enter reason (e.g., "High customer demand")
   - Click "Submit Request"
   - Should see success message
   - Modal should close
   
5. **Verify Backend**
   - Check MongoDB: `db.inventorychangerequests.findOne()`
   - Should have: product, branch, requestedBy, currentStock, requestedStock, reason
   - Check notifications: Owner should have new notification

### Expected Result ✅
- Modal submits without errors
- Inventory change request created in database
- Owner receives notification

---

## Test Scenario 2: Owner Reviews & Approves Request

### Prerequisites
- Manager has submitted a change request (Scenario 1)

### Steps
1. **Login as Owner** (superadmin role)
   - Open `/admin/inventory`
   - Should see **blue toolbar button**: "Review Requests" (and other owner buttons)
   
2. **Open Pending Approvals Modal**
   - Click "📋 Review Requests" button
   - Modal should display list of pending requests with:
     - Product name and SKU
     - Manager who submitted
     - Current → Requested stock comparison
     - Reason submitted
     - Date requested
   
3. **Approve Request**
   - Click "Approve" button on a request
   - Confirm dialog may appear
   - Should see success message
   - Product inventory should update immediately
   
4. **Verify Changes**
   - Product stock in table should increase/change
   - Request should be removed from pending list
   - Check audit log: `db.auditlogs.findOne({action: "inventory_change_approved"})`
   - Manager should receive notification of approval

### Expected Result ✅
- Request moves to approved state
- Product inventory updated in database
- Both users notified
- Audit log created

---

## Test Scenario 3: Owner Rejects Request

### Prerequisites
- Manager has submitted a second change request

### Steps
1. **Open Pending Approvals Again**
   - Click "Review Requests"
   
2. **Reject Request**
   - Click "Reject" button on a request
   - Text area should appear for rejection reason
   - Enter reason (e.g., "Stock levels adequate")
   - Click "Confirm Reject"
   - Should see success message
   
3. **Verify Rejection**
   - Request should show as rejected
   - Inventory should NOT change
   - Check audit log: `db.auditlogs.findOne({action: "inventory_change_rejected"})`
   - Manager should see rejection reason in notification

### Expected Result ✅
- Request marked as rejected
- Rejection reason stored
- No inventory change
- Audit log created
- Manager notified

---

## Test Scenario 4: Owner Creates Restock Order

### Steps
1. **Open Create Restock Order Modal**
   - Click "➕ Create Restock Order" button
   - Modal should display:
     - Supplier Info section (name, email, phone, contact)
     - Branches to Restock (multi-select checkboxes)
     - Products to Restock (dynamic rows with add button)
     - Expected Delivery Date Range (two date inputs)
     - Notes (optional textarea)
   
2. **Fill Supplier Info**
   - Name: "ACME Supplies" (required)
   - Email: "supplier@acme.com"
   - Phone: "555-1234"
   - Contact: "John Smith"
   
3. **Select Branches**
   - Check "Bulacan" and "Cavite"
   - (Note: At least 1 required)
   
4. **Add Products**
   - Click "Add Product"
   - Select product from dropdown
   - Enter quantity (e.g., 50)
   - Add second product if desired
   - Remove button (✕) should work
   
5. **Set Delivery Dates**
   - Start Date: Today
   - End Date: 3 days from now
   - (Note: End must be after start)
   
6. **Submit Order**
   - Click "Create Restock Order"
   - Should see success message
   - Modal should close

### Expected Result ✅
- Restock order created in database
- Status: "pending_signal"
- Contains all products and branch assignments
- Audit log created

---

## Test Scenario 5: Manager Receives Restock

### Prerequisites
- Owner has created a restock order (Scenario 4)
- Owner has "signaled" the order (status changed to "incoming")

### Steps
1. **Login as Manager**
   - Open `/admin/inventory`

2. **Open Incoming Restock Modal**
   - Click "📦 Incoming Restock" button
   - Should display list of incoming deliveries with:
     - Supplier name
     - Expected delivery date range
     - Product count
     - Status badge ("incoming")
   
3. **Expand Delivery Details**
   - Click on a restock item to expand
   - Should show:
     - Supplier contact details
     - Products table with columns: Product | Ordered | Received
     - "Mark as Received" button
   
4. **Adjust Received Quantities** (Partial Delivery)
   - For each product, "Received" should default to ordered quantity
   - Try changing one to less than ordered (e.g., ordered 50, received 45)
   - Leave others as default
   
5. **Mark as Received**
   - Click "Mark as Received" button
   - Confirm dialog may appear
   - Should see success message
   
6. **Verify Inventory Update**
   - Inventory should update with received quantities
   - For partially received products, only that quantity added
   - Product table in main inventory list should reflect changes

### Expected Result ✅
- Restock status changed to "received"
- Product inventories updated correctly (per branch)
- Partial quantities honored
- Audit log created per product
- Owner notified of receipt

---

## API Endpoint Testing

### Quick API Tests (Use Postman or curl)

#### 1. Create Change Request
```
POST /api/inventory-change-requests
Headers: x-auth-token: [manager_token], x-branch: Bulacan
Body: {
  "productId": "[product_id]",
  "currentStock": 30,
  "requestedStock": 50,
  "reason": "Customer demand"
}
Expected: 201 Created, request object returned
```

#### 2. Get Pending Requests (Owner)
```
GET /api/inventory-change-requests/pending
Headers: x-auth-token: [owner_token]
Expected: 200 OK, array of pending requests
```

#### 3. Approve Request
```
PATCH /api/inventory-change-requests/[request_id]/approve
Headers: x-auth-token: [owner_token]
Expected: 200 OK, request marked approved
```

#### 4. Create Restock Order
```
POST /api/restock-orders
Headers: x-auth-token: [owner_token]
Body: {
  "supplier": {
    "name": "ACME",
    "email": "acme@example.com",
    "phone": "555-1234"
  },
  "branches": ["Bulacan"],
  "products": [
    {"productId": "[id]", "quantity": 50}
  ],
  "expectedDeliveryStart": "2024-01-15",
  "expectedDeliveryEnd": "2024-01-17"
}
Expected: 201 Created
```

#### 5. Mark Restock Received
```
PATCH /api/restock-orders/[order_id]/receive
Headers: x-auth-token: [manager_token], x-branch: Bulacan
Body: {
  "receivedProducts": [
    {"productId": "[id]", "quantity": 50}
  ]
}
Expected: 200 OK, inventory updated
```

---

## Database Verification Commands

### Check Inventory Change Requests
```javascript
// MongoDB
db.inventorychangerequests.find({}).pretty()
// Should show request status, product, branch, manager name, etc.
```

### Check Restock Orders
```javascript
db.restockorders.find({}).pretty()
// Should show status (pending_signal, incoming, received, cancelled)
```

### Check Audit Logs
```javascript
db.auditlogs.find({action: {$in: ["inventory_change_requested", "inventory_change_approved", "restock_order_received"]}}).pretty()
// Should show complete audit trail with before/after state
```

### Check Product Stock Update
```javascript
db.products.findOne({name: "Your Product Name"}).pretty()
// Check branchStock Map shows updated quantities per branch
```

---

## Troubleshooting

### Manager Doesn't See "Request Change" Button
- ✅ Verify user role is "admin" (check UserContext profile)
- ✅ Check onRequestChange prop is passed to InventoryList
- ✅ Verify InventoryChangeRequestModal is imported

### Buttons Not Visible in Toolbar
- ✅ Check isOwner/isManager logic: `profile?.role === 'superadmin'` or `'admin'`
- ✅ Verify UserContext is properly imported and used
- ✅ Check browser console for errors

### Branch Filter Not Working
- ✅ Verify branchFilter state updates when dropdown changes
- ✅ Check getProductStock function receives correct prop
- ✅ Verify branchStock Map structure in products

### Modal Doesn't Submit
- ✅ Check form validation (all required fields filled)
- ✅ Verify API endpoint is registered in backend
- ✅ Check browser console for API errors
- ✅ Verify auth token is present in request

### Inventory Not Updating After Approval
- ✅ Check product.branchStock update in controller
- ✅ Verify branch is correctly scoped
- ✅ Check if product refresh (load()) is called after update

---

## Success Criteria ✅

All of the following should work:
- [ ] Manager can open and submit change requests
- [ ] Owner receives and can approve/reject requests
- [ ] Product inventory updates on approval
- [ ] Owner can create restock orders
- [ ] Manager can receive restock with partial quantities
- [ ] Branch filter shows correct stock per branch
- [ ] All actions create audit logs
- [ ] Notifications sent to affected users
- [ ] No console errors
- [ ] All modals display/close correctly
- [ ] Buttons visible based on role

---

## Next Steps (Optional Enhancements)

After verifying all tests pass:

1. **Product Controller Enhancement**
   - Handle new fields: description, image, branchThresholds
   
2. **Shop Branch Selection**
   - Add branch picker before product view for customers
   
3. **Registration Form**
   - Add sourceOfAcquisition field
   
4. **Audit Log Viewer**
   - Component to display audit trail
   
5. **Low Stock Alerts**
   - Automatic notifications for products below branchThreshold
   
6. **Sidebar Notifications**
   - Badge showing pending approval count
