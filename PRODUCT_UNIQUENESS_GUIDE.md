# Product Uniqueness Validation System

## Overview

This system ensures all shop units/products remain unique across the application by implementing:
1. **Database-level uniqueness constraints** - MongoDB indexes prevent duplicates at the data layer
2. **Backend API validation** - Checks before creation/update to provide clear error messages
3. **Frontend deduplication** - Prevents duplicate display in the shop interface

## Architecture

### 1. Database Layer (MongoDB)

**File:** [backend/src/models/Product.js](backend/src/models/Product.js)

The Product schema implements two unique compound indexes:

```javascript
// Case-insensitive unique index on SKU
productSchema.index({ sku: 1 }, { 
  unique: true,
  collation: { locale: 'en', strength: 2 },
  name: 'idx_sku_unique_case_insensitive'
});

// Case-insensitive unique index on name+specs combination
productSchema.index({ name: 1, specs: 1 }, {
  unique: true,
  collation: { locale: 'en', strength: 2 },
  name: 'idx_name_specs_unique_case_insensitive'
});
```

**Benefits:**
- No two products can have the same SKU
- No two products can have the same name+specs combination (product variants)
- Case-insensitive matching prevents "TCL AC" vs "tcl ac" duplicates
- Database enforces uniqueness at the lowest level

### 2. Backend Validation Layer

**Files:**
- [backend/src/utils/productValidation.js](backend/src/utils/productValidation.js) - Validation utilities
- [backend/src/controllers/productController.js](backend/src/controllers/productController.js) - API endpoints

#### Validation Utility Functions

```javascript
// Check for duplicate SKU
const duplicateSku = await checkDuplicateSku(sku, excludeId);

// Check for duplicate name+specs
const duplicateNameSpecs = await checkDuplicateNameSpecs(name, specs, excludeId);

// Comprehensive validation (used in controllers)
const validation = await validateProductUniqueness({
  sku: 'TAC-10CSD-KEI-S-2',
  name: 'TCL Full DC Inverter AC',
  specs: '1.0HP'
}, productIdToExclude);

if (validation.isDuplicate) {
  // Handle duplicate
  console.log(validation.duplicateType); // 'sku' or 'name_specs'
  console.log(validation.existingProduct); // Details of existing product
}
```

#### API Endpoint Validation

**POST /api/products (Create Product)**
```javascript
POST /api/products
{
  "name": "TCL Full DC Inverter AC",
  "sku": "TAC-10CSD-KEI-S-2",
  "specs": "1.0HP",
  "brand": "TCL",
  "category": "split",
  "price": 21500,
  "stock": 16
}

// Success Response (201)
{
  "product": { ... }
}

// Duplicate SKU Error (409)
{
  "message": "A product with this SKU already exists",
  "field": "sku",
  "duplicateType": "sku",
  "existingProduct": {
    "id": "507f1f77bcf86cd799439011",
    "name": "TCL Full DC Inverter AC",
    "sku": "TAC-10CSD-KEI-S-2",
    "specs": "1.0HP"
  }
}

// Duplicate Name+Specs Error (409)
{
  "message": "A product with this name and specs combination already exists",
  "field": "name",
  "duplicateType": "name_specs",
  "existingProduct": { ... }
}
```

**PATCH /api/products/:productId (Update Product)**
- Validates that name/specs changes don't create duplicates
- Excludes current product from duplicate check
- Provides same error response format as create

### 3. Frontend Deduplication Layer

**File:** [front/src/utils/productDeduplication.js](front/src/utils/productDeduplication.js)

Provides comprehensive utilities for frontend product management:

```javascript
import {
  getProductVariantKey,
  deduplicateProducts,
  validateProductList,
  mergeProductLists
} from '../../utils/productDeduplication';

// Create unique key for a product (SKU-based, falls back to name+specs)
const key = getProductVariantKey(product);

// Remove duplicates from product array
const unique = deduplicateProducts(products, { verbose: true });

// Validate product list for issues
const report = validateProductList(products);

// Merge backend and fallback products
const merged = mergeProductLists(fallbackProducts, backendProducts, {
  preferBackend: true,
  verbose: false
});
```

**Usage in Shop Component:** [front/src/components/shop/Shop.js](front/src/components/shop/Shop.js)

```javascript
const products = useMemo(() => {
  // Merge backend and fallback products
  const merged = mergeProductLists(fallbackProducts, backendProducts, {
    preferBackend: true,
    verbose: false
  });

  // Remove any duplicates
  const deduplicated = deduplicateProducts(merged, {
    verbose: process.env.NODE_ENV !== 'production'
  });

  return deduplicated;
}, [backendProducts]);
```

### 4. Database Cleanup Utilities

**File:** [backend/src/utils/productCleanup.js](backend/src/utils/productCleanup.js)

For removing existing duplicates from the database:

```javascript
const { cleanupDuplicateProducts, validateProductUniqueness } = 
  require('./utils/productCleanup');

// Validate current state (no changes)
const validation = await validateProductUniqueness();
console.log(validation);
// {
//   totalProducts: 45,
//   duplicateSkus: [],
//   duplicateNameSpecs: [],
//   isValid: true
// }

// Dry run - see what would be deleted
const dryRun = await cleanupDuplicateProducts({ 
  dryRun: true,
  verbose: true 
});

// Actually delete duplicates
const result = await cleanupDuplicateProducts({ 
  dryRun: false,
  verbose: true 
});
```

## Data Flow

```
User Creates/Updates Product
        ↓
[Frontend Form Validation]
        ↓
API Request (POST /products or PATCH /products/:id)
        ↓
[Backend productController]
    validateProductUniqueness() ← Check for existing duplicates
        ↓
    [Error 409 if duplicate] → Send to Frontend
        ↓
    [No error] → Create/Update Product
        ↓
[MongoDB Index Validation]
    Unique constraint on SKU
    Unique constraint on name+specs
        ↓
    [Index violation] → Error 11000 → Convert to 409
        ↓
    [Success] → Product saved
        ↓
Product Listed in Shop
        ↓
[Frontend Shop Component]
    Fetch /products/public
        ↓
    mergeProductLists() - Merge backend with fallbacks
        ↓
    deduplicateProducts() - Remove any remaining duplicates
        ↓
[Display in ProductGrid]
```

## Duplicate Handling Strategy

### By SKU (Unique ID)
- **Most reliable identifier** for distinct products
- Example: `AHAC-MINV1023EHW` vs `AHAC-MINV1523EHW` (same product, different HP)
- Cannot have two products with same SKU

### By Name + Specs (Product Variant)
- **Secondary uniqueness constraint**
- Handles products without distinct SKUs
- Example: "TCL Full DC Inverter AC" + "1.0HP" must be unique
- Allows same name with different specs: "TCL AC 1.0HP" vs "TCL AC 1.5HP"

### Case Insensitivity
- "TCL AC" vs "tcl ac" vs "Tcl Ac" are treated as the same
- Prevents subtle duplicates from manual entry variations

## Error Handling

### Frontend Validation Error (409 Conflict)
```javascript
// Duplicate SKU
{
  "message": "A product with this SKU already exists",
  "field": "sku",
  "code": "E_DUPLICATE_PRODUCT",
  "existingProduct": { id, name, sku }
}

// Duplicate Name+Specs
{
  "message": "A product with this name and specs combination already exists",
  "field": "name",
  "code": "E_DUPLICATE_PRODUCT",
  "existingProduct": { id, name, sku, specs }
}
```

### Display User Message
```javascript
if (error.field === 'sku') {
  alert(`⚠️ ${error.message}\n\nExisting product: ${error.existingProduct.name}`);
} else {
  alert(`⚠️ ${error.message}\n\nExisting product: ${error.existingProduct.name} (${error.existingProduct.specs})`);
}
```

## Implementation Checklist

### Backend
- [x] Product model has unique indexes for SKU and name+specs
- [x] productValidation.js utility functions created
- [x] createProduct validates before insertion
- [x] updateProduct validates before update
- [x] Database-level error handling for violations
- [x] productCleanup.js utility for cleanup operations

### Frontend
- [x] productDeduplication.js utility functions created
- [x] Shop.js imports and uses deduplication utilities
- [x] mergeProductLists handles combining data sources
- [x] deduplicateProducts prevents display of duplicates
- [x] Console warnings in development for debugging

### Operations
- [ ] Run validation to check current state: `node scripts/validateProducts.js`
- [ ] If duplicates exist, run cleanup: `node scripts/cleanupDuplicates.js`
- [ ] Verify post-cleanup: `node scripts/validateProducts.js`

## Testing Uniqueness

### Test Case 1: Duplicate SKU
```javascript
// Try to create with existing SKU
POST /api/products
{
  "name": "New Product Name",
  "sku": "AHAC-MINV1023EHW", // Already exists
  "specs": "Different"
}

// Expected: 409 Error - SKU already exists
```

### Test Case 2: Duplicate Name+Specs
```javascript
// Try to create with existing name+specs
POST /api/products
{
  "name": "American Home Inverter AC",
  "specs": "1.0HP",
  "sku": "NEW-SKU-123" // Different SKU
}

// Expected: 409 Error - Name+Specs combination exists
```

### Test Case 3: Update Creates Duplicate
```javascript
// Try to update product name to existing variant
PATCH /api/products/507f1f77bcf86cd799439012
{
  "name": "American Home Inverter AC",
  "specs": "1.0HP" // This name+specs exists in another product
}

// Expected: 409 Error - Name+Specs combination exists
```

### Test Case 4: Frontend Deduplication
```javascript
// Frontend receives products from backend
// Some might be duplicates
const products = mergeProductLists(fallback, backend);
const unique = deduplicateProducts(products, { verbose: true });

// Should see console warnings for removed duplicates
// ⚠️ Duplicate product removed: "TCL AC" (1.0HP) - SKU: TAC-10CSD-KEI-S-2
```

## Maintenance

### Regular Validation
```bash
# Check if database has any duplicates
npm run validate-products

# Output example:
# {
#   "totalProducts": 45,
#   "uniqueSkuCount": 45,
#   "uniqueNameSpecsCount": 45,
#   "duplicateSkus": [],
#   "duplicateNameSpecs": [],
#   "isValid": true
# }
```

### Cleanup If Needed
```bash
# Dry run - see what would be deleted
npm run cleanup-products -- --dry-run

# Actually perform cleanup
npm run cleanup-products -- --execute
```

## Notes

- **Database Indexes:** Created automatically on application start via Mongoose schema
- **Index Names:** `idx_sku_unique_case_insensitive`, `idx_name_specs_unique_case_insensitive`
- **Collation:** Uses `en` locale with `strength: 2` (case-insensitive, accent-insensitive)
- **Frontend Warning:** Development mode logs duplicate removals to console
- **Production:** Duplicates prevented at all layers, plus frontend safeguard
