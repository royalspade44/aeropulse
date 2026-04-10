const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  listUsers,
  updateProfile,
  updatePreferences,
  updatePrivacy,
  updateNotifications,
  changePassword,
  deleteAccount,
  unlockUser,
} = require("../controllers/userController");

const router = express.Router();

router.use(requireAuth);
router.get("/", listUsers);
router.post("/:id/unlock", unlockUser);
router.patch("/profile", updateProfile);
router.patch("/preferences", updatePreferences);
router.patch("/privacy", updatePrivacy);
router.patch("/notifications", updateNotifications);
router.patch("/password", changePassword);
router.delete("/me", deleteAccount);

module.exports = router;
