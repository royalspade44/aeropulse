const Notification = require("../models/Notification");

const listMyNotifications = async (req, res) => {
  const userId = req.authUser._id;
  let notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(30);

  if (!notifications.length) {
    await Notification.insertMany([
      {
        user: userId,
        title: "Welcome to AeroPulse",
        message: "Your account is ready. You can now shop, book services, and track orders.",
      },
      {
        user: userId,
        title: "Track your order status",
        message: "Visit My Orders or Profile to monitor TO PAY, TO DELIVER, TO INSTALL, and COMPLETE states.",
      },
    ]);
    notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(30);
  }

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
  await notification.save();
  return res.json({ notification: notification.toJSON() });
};

const markAllNotificationsRead = async (req, res) => {
  const userId = req.authUser._id;
  const result = await Notification.updateMany(
    { user: userId, unread: true },
    { $set: { unread: false } }
  );

  return res.json({
    message: "Notifications marked as read",
    modifiedCount: Number(result.modifiedCount || 0),
  });
};

module.exports = { listMyNotifications, markNotificationRead, markAllNotificationsRead };
