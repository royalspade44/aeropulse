/**
 * Frontend product deduplication utilities
 * Prevents duplicate products from being displayed in the shop
 */

/**
 * Creates a unique key for a product variant
 * Uses SKU/model as primary identifier, then name+specs as secondary
 * @param {Object} product - Product object
 * @returns {string} - Unique variant key
 */
export const getProductVariantKey = (product) => {
  const sku = String(product.sku || product.model || '').trim().toLowerCase();
  const name = String(product.name || '').trim().toLowerCase();
  const specs = String(product.specs || '').trim().toLowerCase();
  
  // SKU is the most reliable identifier if available
  if (sku) {
    return `sku::${sku}`;
  }
  
  // Fall back to name+specs combination
  if (name) {
    return `variant::${name}::${specs}`;
  }
  
  // Last resort: use product id if available
  return `id::${String(product.id || '').trim()}`;
};

/**
 * Deduplicates an array of products by their unique identifiers
 * Keeps the first occurrence of each unique product
 * @param {Array} products - Array of product objects
 * @param {Object} options - Deduplication options
 * @param {boolean} options.verbose - Log removed duplicates
 * @returns {Array} - Deduplicated products array
 */
export const deduplicateProducts = (products, options = {}) => {
  const { verbose = false } = options;
  const seenVariants = new Set();
  const deduplicated = [];
  const removedDuplicates = [];
  
  for (const product of products) {
    const variantKey = getProductVariantKey(product);
    
    if (seenVariants.has(variantKey)) {
      // This is a duplicate - track it for logging
      removedDuplicates.push({
        name: product.name,
        specs: product.specs,
        sku: product.sku || product.model,
        id: product.id,
        variantKey
      });
      
      if (verbose) {
        console.warn(
          `⚠️ Duplicate product removed: "${product.name}" (${product.specs}) - SKU: ${product.sku || product.model}`
        );
      }
      continue;
    }
    
    seenVariants.add(variantKey);
    deduplicated.push(product);
  }
  
  if (verbose && removedDuplicates.length > 0) {
    console.log(`Removed ${removedDuplicates.length} duplicate products`);
  }
  
  return deduplicated;
};

/**
 * Validates product data for common issues
 * @param {Array} products - Array of product objects
 * @returns {Object} - Validation report
 */
export const validateProductList = (products) => {
  const report = {
    total: products.length,
    issues: [],
    byIssueType: {}
  };
  
  const seen = new Map();
  
  for (const product of products) {
    // Check for missing required fields
    if (!product.name) {
      report.issues.push({
        product: product.id,
        issue: 'Missing product name',
        severity: 'error'
      });
      report.byIssueType['missing_name'] = (report.byIssueType['missing_name'] || 0) + 1;
    }
    
    if (!product.price) {
      report.issues.push({
        product: product.id,
        issue: 'Missing or invalid price',
        severity: 'warning'
      });
      report.byIssueType['missing_price'] = (report.byIssueType['missing_price'] || 0) + 1;
    }
    
    // Check for potential duplicates
    const variantKey = getProductVariantKey(product);
    if (seen.has(variantKey)) {
      report.issues.push({
        product: product.id,
        issue: `Duplicate of product ${seen.get(variantKey).id}`,
        severity: 'error'
      });
      report.byIssueType['duplicate'] = (report.byIssueType['duplicate'] || 0) + 1;
    } else {
      seen.set(variantKey, product);
    }
  }
  
  return report;
};

/**
 * Merges multiple product lists while preventing duplicates
 * Backend products take precedence over fallback products
 * @param {Array} fallbackProducts - Fallback product list
 * @param {Array} backendProducts - Backend product list
 * @param {Object} options - Merge options
 * @param {boolean} options.preferBackend - If true, backend data replaces fallback (default: true)
 * @param {boolean} options.verbose - Log merge operations
 * @returns {Array} - Merged and deduplicated products
 */
export const mergeProductLists = (fallbackProducts, backendProducts, options = {}) => {
  const { preferBackend = true, verbose = false } = options;
  const merged = [];
  const seen = new Map();
  
  // Add fallback products first
  for (const product of fallbackProducts) {
    const variantKey = getProductVariantKey(product);
    
    if (!seen.has(variantKey)) {
      merged.push(product);
      seen.set(variantKey, { source: 'fallback', product });
    }
  }
  
  // Add or update with backend products
  for (const backendProduct of backendProducts) {
    const variantKey = getProductVariantKey(backendProduct);
    const existing = seen.get(variantKey);
    
    if (existing && preferBackend) {
      // Replace fallback with backend data
      const index = merged.findIndex(p => getProductVariantKey(p) === variantKey);
      if (index >= 0) {
        merged[index] = backendProduct;
        seen.set(variantKey, { source: 'backend_updated', product: backendProduct });
        
        if (verbose) {
          console.log(`Updated product from backend: "${backendProduct.name}"`);
        }
      }
    } else if (!existing) {
      // Add new backend product
      merged.push(backendProduct);
      seen.set(variantKey, { source: 'backend_new', product: backendProduct });
      
      if (verbose) {
        console.log(`Added new backend product: "${backendProduct.name}"`);
      }
    }
  }
  
  return merged;
};

export default {
  getProductVariantKey,
  deduplicateProducts,
  validateProductList,
  mergeProductLists
};
