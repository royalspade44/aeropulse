const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { listMyNotifications } = require("../controllers/notificationController");

const router = express.Router();

router.use(requireAuth);
router.get("/me", listMyNotifications);

module.exports = router;
