const express = require("express");
const { requireAuth, allowRoles } = require("../middleware/auth");
const {
  listUsers,
  getProfile,
  getProfileById,
  updateProfile,
  updateProfileById,
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  updateSettings,
  updatePreferences,
  updatePrivacy,
  updateNotifications,
  changePassword,
  requestPasswordChangeEmail,
  deleteAccount,
  unlockUser,
} = require("../controllers/userController");

const router = express.Router();

router.use(requireAuth);
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.put("/profile/update", updateProfile);

router.patch("/settings", updateSettings);
router.put("/settings/update", updateSettings);

router.patch("/preferences", updatePreferences);
router.patch("/privacy", updatePrivacy);
router.patch("/notifications", updateNotifications);

router.get("/addresses", listAddresses);
router.post("/addresses", addAddress);
router.patch("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);
router.patch("/addresses/:addressId/default", setDefaultAddress);

router.patch("/password", changePassword);
router.post("/password/request-email", requestPasswordChangeEmail);
router.delete("/account", deleteAccount);
router.delete("/me", deleteAccount);

router.get("/", allowRoles("admin", "superadmin"), listUsers);
router.get("/:id/profile", allowRoles("admin", "superadmin"), getProfileById);
router.put("/:id/profile", allowRoles("admin", "superadmin"), updateProfileById);
router.post("/:id/unlock", allowRoles("admin", "superadmin"), unlockUser);

module.exports = router;
