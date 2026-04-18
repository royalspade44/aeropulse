const express = require("express");
const { login, register, me, googleStart, googleCallback } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/google/start", googleStart);
router.get("/google/callback", googleCallback);
router.get("/me", requireAuth, me);

module.exports = router;
