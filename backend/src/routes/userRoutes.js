const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  updateProfile,
  updatePreferences,
  updatePrivacy,
  updateNotifications,
  changePassword,
  deleteAccount,
} = require("../controllers/userController");

const router = express.Router();

router.use(requireAuth);
router.patch("/profile", updateProfile);
router.patch("/preferences", updatePreferences);
router.patch("/privacy", updatePrivacy);
router.patch("/notifications", updateNotifications);
router.patch("/password", changePassword);
router.delete("/me", deleteAccount);

module.exports = router;
