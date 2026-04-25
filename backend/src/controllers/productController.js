const Product = require("../models/Product");
const { BRANCHES } = require("../domain/branchRouting");

const SAMPLE_PRODUCTS = [
  { name: "American Home Inverter AC", sku: "AHAC-MINV1023EHW", brand: "American Home", category: "split", specs: "1.0HP", price: 18499, threshold: 3, stock: 14 },
  { name: "TCL Full DC Inverter AC", sku: "TAC-10CSD-KEI-S-2", brand: "TCL", category: "split", specs: "1.0HP", price: 21500, threshold: 3, stock: 12 },
  { name: "Midea Celest Pro AC", sku: "MSCE-10CRFN8", brand: "Midea", category: "split", specs: "1.0HP", price: 22999, threshold: 3, stock: 10 },
  { name: "LG Premium Dual Inverter AC", sku: "HSN09IPX3", brand: "LG", category: "split", specs: "1.0HP", price: 31499, threshold: 2, stock: 8 },
  { name: "TCL Full DC Inverter Window AC", sku: "TAC09-CWI-UJE2", brand: "TCL", category: "window", specs: "1.0HP", price: 21995, threshold: 2, stock: 9 },
  { name: "Samsung Digital Inverter AC", sku: "AR09TYHYE", brand: "Samsung", category: "split", specs: "1.0HP", price: 22999, threshold: 2, stock: 7 },
];

let sampleSeedPromise = null;

const ensureSampleInventory = async () => {
  if (sampleSeedPromise) {
    return sampleSeedPromise;
  }

  sampleSeedPromise = (async () => {
    const existing = await Product.countDocuments({});
    if (existing > 0) {
      return;
    }

    const docs = SAMPLE_PRODUCTS.map((item) => {
      const perBranch = Math.max(1, Math.floor((Number(item.stock) || 0) / BRANCHES.length));
      const branchStock = BRANCHES.reduce((acc, branch) => {
        acc[branch] = perBranch;
        return acc;
      }, {});

      const computedTotal = Object.values(branchStock).reduce((sum, value) => sum + Number(value || 0), 0);
      return {
        ...item,
        stock: computedTotal,
        branchStock,
        features: [],
      };
    });

    await Product.insertMany(docs, { ordered: false });
  })().finally(() => {
    sampleSeedPromise = null;
  });

  return sampleSeedPromise;
};

const toBranchStockObject = (product) => BRANCHES.reduce((acc, branch) => {
  acc[branch] = Number(product.branchStock?.get(branch) || 0);
  return acc;
}, {});

const toRoleAwareProduct = (product, req) => {
  const base = product.toJSON();
  const branchStock = toBranchStockObject(product);
  if (req.authUser.role === "superadmin") {
    return { ...base, branchStock };
  }
  const branch = req.activeBranch;
  return {
    ...base,
    activeBranch: branch,
    stock: Number(branchStock[branch] || 0),
    branchStock: { [branch]: Number(branchStock[branch] || 0) },
  };
};

const requireAdmin = (req, res) => {
  if (req.authUser.role !== "admin" && req.authUser.role !== "superadmin") {
    res.status(403).json({ message: "Forbidden" });
    return false;
  }
  return true;
};

const listProducts = async (req, res) => {
  await ensureSampleInventory();
  const products = await Product.find({}).sort({ createdAt: -1 });
  return res.json({ products: products.map((p) => toRoleAwareProduct(p, req)) });
};

const listPublicProducts = async (_req, res) => {
  await ensureSampleInventory();
  const products = await Product.find({ stock: { $gt: 0 } }).sort({ createdAt: -1 });
  return res.json({ products: products.map((p) => p.toJSON()) });
};

const listLowStockProducts = async (req, res) => {
  const products = await Product.find({
    threshold: { $gt: 0 },
  }).sort({ stock: 1, createdAt: -1 });
  const roleAware = products.map((p) => toRoleAwareProduct(p, req));
  const lowStock = roleAware.filter((p) => Number(p.stock || 0) < Number(p.threshold || 0));
  return res.json({ products: lowStock });
};

const createProduct = async (req, res) => {
  if (!requireAdmin(req, res)) return null;

  const {
    name,
    sku,
    brand = "",
    category = "split",
    specs = "",
    features = [],
    stock = 0,
    threshold = 0,
    price = 0,
    branchStock = {},
  } = req.body || {};
  if (!name || !sku) {
    return res.status(400).json({ message: "Name and SKU are required" });
  }

  const normalizedBranchStock = BRANCHES.reduce((acc, branch) => {
    const value = Number(branchStock?.[branch]) || 0;
    acc[branch] = Math.max(0, value);
    return acc;
  }, {});

  if (req.authUser.role !== "superadmin") {
    const scoped = req.activeBranch;
    BRANCHES.forEach((branch) => {
      if (branch !== scoped) normalizedBranchStock[branch] = 0;
    });
  }
  const totalStock = Object.values(normalizedBranchStock).reduce((sum, value) => sum + value, 0);

  try {
    const product = await Product.create({
      name,
      sku,
      brand,
      category,
      specs,
      features: Array.isArray(features) ? features.filter(Boolean) : [],
      stock: totalStock || Number(stock) || 0,
      branchStock: normalizedBranchStock,
      threshold: Number(threshold) || 0,
      price: Number(price) || 0,
    });
    return res.status(201).json({ product: product.toJSON() });
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ message: "SKU already exists" });
    }
    throw e;
  }
};

const restockProduct = async (req, res) => {
  if (!requireAdmin(req, res)) return null;

  const { productId } = req.params;
  const { quantity = 0, branch, features } = req.body || {};

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const qty = Number(quantity) || 0;
  if (qty < 0) {
    return res.status(400).json({ message: "quantity must be a positive number" });
  }

  if (req.authUser.role !== "superadmin") {
    const scopedBranch = req.activeBranch;
    const current = Number(product.branchStock?.get(scopedBranch) || 0);
    product.branchStock.set(scopedBranch, current + qty);
  } else if (branch && BRANCHES.includes(branch)) {
    const current = Number(product.branchStock?.get(branch) || 0);
    product.branchStock.set(branch, current + qty);
  } else {
    BRANCHES.forEach((name) => {
      const current = Number(product.branchStock?.get(name) || 0);
      product.branchStock.set(name, current + qty);
    });
  }

  if (Array.isArray(features)) {
    product.features = features.filter(Boolean);
  }

  const summedStock = BRANCHES.reduce((sum, name) => sum + Number(product.branchStock?.get(name) || 0), 0);
  product.stock = summedStock;
  await product.save();

  return res.json({ product: toRoleAwareProduct(product, req) });
};

const updateBranchStock = async (req, res) => {
  if (!requireAdmin(req, res)) return null;

  const { productId } = req.params;
  const { branch, action = "set", quantity = 0 } = req.body || {};

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const scopedBranch = req.authUser.role === "superadmin" ? branch : req.activeBranch;
  if (!scopedBranch || !BRANCHES.includes(scopedBranch)) {
    return res.status(400).json({ message: "A valid branch is required" });
  }

  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty < 0) {
    return res.status(400).json({ message: "quantity must be a non-negative number" });
  }

  const current = Number(product.branchStock?.get(scopedBranch) || 0);
  let next = current;

  if (action === "add") {
    next = current + qty;
  } else if (action === "remove") {
    next = Math.max(0, current - qty);
  } else if (action === "set") {
    next = qty;
  } else {
    return res.status(400).json({ message: "action must be one of: add, remove, set" });
  }

  product.branchStock.set(scopedBranch, next);
  const summedStock = BRANCHES.reduce((sum, name) => sum + Number(product.branchStock?.get(name) || 0), 0);
  product.stock = summedStock;
  await product.save();

  return res.json({ product: toRoleAwareProduct(product, req) });
};

const updateProduct = async (req, res) => {
  if (!requireAdmin(req, res)) return null;

  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const { name, brand, category, specs, features, threshold, price } = req.body || {};

  if (name !== undefined) product.name = String(name).trim();
  if (brand !== undefined) product.brand = String(brand).trim();
  if (category !== undefined) product.category = String(category).trim();
  if (specs !== undefined) product.specs = String(specs).trim();
  if (Array.isArray(features)) product.features = features.filter(Boolean);
  if (threshold !== undefined) product.threshold = Math.max(0, Number(threshold) || 0);
  if (price !== undefined) product.price = Math.max(0, Number(price) || 0);

  await product.save();
  return res.json({ product: toRoleAwareProduct(product, req) });
};

const deleteProduct = async (req, res) => {
  if (!requireAdmin(req, res)) return null;

  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  await product.deleteOne();
  return res.json({ message: "Product deleted successfully" });
};

module.exports = {
  listProducts,
  listPublicProducts,
  listLowStockProducts,
  createProduct,
  restockProduct,
  updateBranchStock,
  updateProduct,
  deleteProduct,
};

