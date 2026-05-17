const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  listProducts,
  listPublicProducts,
  listLowStockProducts,
  getProductImage,
  createProduct,
  restockProduct,
  updateBranchStock,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

router.get("/public", listPublicProducts);
router.get("/:productId/image", getProductImage);

router.use(requireAuth);

router.get("/low-stock", listLowStockProducts);
router.get("/", listProducts);
router.post("/", createProduct);
router.patch("/:productId/restock", restockProduct);
router.patch("/:productId/stock", updateBranchStock);
router.patch("/:productId", updateProduct);
router.delete("/:productId", deleteProduct);

module.exports = router;
