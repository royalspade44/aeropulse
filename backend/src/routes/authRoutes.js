const express = require("express");
const {
	login,
	register,
	me,
	googleStart,
	googleCallback,
	requestPasswordReset,
	resetPassword,
	requestOtp,
	verifyOtp,
	resetPasswordWithCode,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPasswordWithCode);
router.post("/reset-password/:token", resetPassword);
router.get("/google/start", googleStart);
router.get("/google/callback", googleCallback);
router.get("/me", requireAuth, me);

module.exports = router;
