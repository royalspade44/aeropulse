const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  listProducts,
  listPublicProducts,
  listLowStockProducts,
  createProduct,
  restockProduct,
} = require("../controllers/productController");

const router = express.Router();

router.get("/public", listPublicProducts);

router.use(requireAuth);

router.get("/low-stock", listLowStockProducts);
router.get("/", listProducts);
router.post("/", createProduct);
router.patch("/:productId/restock", restockProduct);

module.exports = router;

