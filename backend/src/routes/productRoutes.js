const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { listProducts, listLowStockProducts, createProduct } = require("../controllers/productController");

const router = express.Router();

router.use(requireAuth);

router.get("/low-stock", listLowStockProducts);
router.get("/", listProducts);
router.post("/", createProduct);

module.exports = router;

