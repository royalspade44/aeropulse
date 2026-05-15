const Notification = require("../models/Notification");
const User = require("../models/User");

const listMyNotifications = async (req, res) => {
  res.set("Cache-Control", "no-store");
  const userId = req.authUser._id;
  const user = await User.findById(userId).select("notifications");
  const userNotifications = user?.notifications?.toObject?.() || user?.notifications || {};
  if (userNotifications.inApp === false || userNotifications.push === false) {
    return res.json({ notifications: [] });
  }

  let notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(30);

  if (!notifications.length) {
    // Check if this is the user's first login
    const isFirstLogin = !user.lastLogin;
    const welcomeTitle = isFirstLogin ? "Welcome to AeroPulse" : "Welcome back to AeroPulse";
    const welcomeMessage = isFirstLogin 
      ? "Your account is ready. You can now shop, book services, and track orders."
      : "Great to see you again! Check out new products and manage your orders.";

    await Notification.insertMany([
      {
        user: userId,
        type: "account",
        title: welcomeTitle,
        message: welcomeMessage,
      },
      {
        user: userId,
        type: "system",
        title: "Track your order status",
        message: "Visit My Orders or Profile to monitor TO PAY, TO DELIVER, TO INSTALL, and COMPLETE states.",
      },
    ]);
    notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(30);
  }

  notifications = notifications.filter((item) => {
    if (item.type === "account" && userNotifications.accountUpdates === false) return false;
    if (item.type === "order" && userNotifications.orderUpdates === false) return false;
    if (item.type === "system" && userNotifications.systemAlerts === false) return false;
    return true;
  });

  return res.json({ notifications: notifications.map((item) => item.toJSON()) });
};

const markNotificationRead = async (req, res) => {
  const userId = req.authUser._id;
  const { id } = req.params;

  const notification = await Notification.findOne({ _id: id, user: userId });
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  notification.unread = false;
  notification.status = "read";
  await notification.save();
  return res.json({ notification: notification.toJSON() });
};

const markAllNotificationsRead = async (req, res) => {
  const userId = req.authUser._id;
  const result = await Notification.updateMany(
    { user: userId, unread: true },
    { $set: { unread: false, status: "read" } }
  );

  return res.json({
    message: "Notifications marked as read",
    modifiedCount: Number(result.modifiedCount || 0),
  });
};

module.exports = { listMyNotifications, markNotificationRead, markAllNotificationsRead };
