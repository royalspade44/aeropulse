const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { createOrder, listMyOrders, getMyOrderSummary } = require("../controllers/orderController");

const router = express.Router();

router.use(requireAuth);
router.post("/", createOrder);
router.get("/me", listMyOrders);
router.get("/me/summary", getMyOrderSummary);

module.exports = router;
