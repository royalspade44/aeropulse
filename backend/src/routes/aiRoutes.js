const express = require("express");

const { requireAuth } = require("../middleware/auth");
const { getUnitHealthInsight } = require("../controllers/aiController");

const router = express.Router();

router.post("/unit-health", requireAuth, getUnitHealthInsight);

module.exports = router;