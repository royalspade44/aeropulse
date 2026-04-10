const Product = require("../models/Product");

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

const listLowStockProducts = async (_req, res) => {
  const products = await Product.find({
    threshold: { $gt: 0 },
    $expr: { $lt: ["$stock", "$threshold"] },
  }).sort({ stock: 1, createdAt: -1 });
  return res.json({ products: products.map((p) => p.toJSON()) });
};

const createProduct = async (req, res) => {
  if (!requireAdmin(req, res)) return null;

  const { name, sku, stock = 0, threshold = 0, price = 0 } = req.body || {};
  if (!name || !sku) {
    return res.status(400).json({ message: "Name and SKU are required" });
  }

  try {
    const product = await Product.create({
      name,
      sku,
      stock: Number(stock) || 0,
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

module.exports = { listProducts, listLowStockProducts, createProduct };

