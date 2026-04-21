const Product = require("../models/Product");
const { BRANCHES } = require("../domain/branchRouting");

const requireAdmin = (req, res) => {
  if (req.authUser.role !== "admin" && req.authUser.role !== "superadmin") {
    res.status(403).json({ message: "Forbidden" });
    return false;
  }
  return true;
};

const listProducts = async (_req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 });
  return res.json({ products: products.map((p) => p.toJSON()) });
};

const listPublicProducts = async (_req, res) => {
  const products = await Product.find({ stock: { $gt: 0 } }).sort({ createdAt: -1 });
  return res.json({ products: products.map((p) => p.toJSON()) });
};

const listLowStockProducts = async (_req, res) => {
  const products = await Product.find({
    threshold: { $gt: 0 },
    $expr: { $lt: ["$stock", "$threshold"] },
  }).sort({ stock: 1, createdAt: -1 });
  return res.json({ products: products.map((p) => p.toJSON()) });
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

  if (branch && BRANCHES.includes(branch)) {
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

  return res.json({ product: product.toJSON() });
};

module.exports = { listProducts, listPublicProducts, listLowStockProducts, createProduct, restockProduct };

