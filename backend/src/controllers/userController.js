const bcrypt = require("bcryptjs");

const updateProfile = async (req, res) => {
  const { name, name_first, name_last, phone, address } = req.body;
  const user = req.authUser;

  if (name !== undefined) user.name = name;
  if (name_first !== undefined) user.name_first = name_first;
  if (name_last !== undefined) user.name_last = name_last;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;

  await user.save();
  return res.json({ user: user.toJSON() });
};

const updatePreferences = async (req, res) => {
  req.authUser.preferences = { ...req.authUser.preferences.toObject(), ...req.body };
  await req.authUser.save();
  return res.json({ user: req.authUser.toJSON() });
};

const updatePrivacy = async (req, res) => {
  req.authUser.privacy = { ...req.authUser.privacy.toObject(), ...req.body };
  await req.authUser.save();
  return res.json({ user: req.authUser.toJSON() });
};

const updateNotifications = async (req, res) => {
  req.authUser.notifications = { ...req.authUser.notifications.toObject(), ...req.body };
  await req.authUser.save();
  return res.json({ user: req.authUser.toJSON() });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const valid = await bcrypt.compare(currentPassword, req.authUser.passwordHash);
  if (!valid) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }
  req.authUser.passwordHash = await bcrypt.hash(newPassword, 10);
  await req.authUser.save();
  return res.json({ message: "Password changed successfully" });
};

const deleteAccount = async (req, res) => {
  await req.authUser.deleteOne();
  return res.json({ message: "Account deleted successfully" });
};

module.exports = {
  updateProfile,
  updatePreferences,
  updatePrivacy,
  updateNotifications,
  changePassword,
  deleteAccount,
};
