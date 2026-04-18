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

module.exports = { listMyNotifications };
