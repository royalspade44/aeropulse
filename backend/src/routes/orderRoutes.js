const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  createOrder,
  listMyOrders,
  getMyOrderSummary,
  approveOrder,
  listOrdersForAdmin,
  processOrder,
} = require("../controllers/orderController");

const router = express.Router();

router.use(requireAuth);
router.post("/", createOrder);
router.get("/", listOrdersForAdmin);
router.patch("/:orderId/approve", approveOrder);
router.patch("/:orderId/process", processOrder);
router.get("/me", listMyOrders);
router.get("/me/summary", getMyOrderSummary);

module.exports = router;
