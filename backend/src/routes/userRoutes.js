const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  listUsers,
  updateProfile,
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
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
router.get("/addresses", listAddresses);
router.post("/addresses", addAddress);
router.patch("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);
router.patch("/addresses/:addressId/default", setDefaultAddress);
router.patch("/preferences", updatePreferences);
router.patch("/privacy", updatePrivacy);
router.patch("/notifications", updateNotifications);
router.patch("/password", changePassword);
router.delete("/me", deleteAccount);

module.exports = router;
