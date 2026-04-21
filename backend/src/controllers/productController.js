const Product = require("../models/Product");
const { BRANCHES } = require("../domain/branchRouting");

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
  const products = await Product.find({}).sort({ createdAt: -1 });
  return res.json({ products: products.map((p) => toRoleAwareProduct(p, req)) });
};

const listPublicProducts = async (_req, res) => {
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

module.exports = { listProducts, listPublicProducts, listLowStockProducts, createProduct, restockProduct, updateBranchStock };

