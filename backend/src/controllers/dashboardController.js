const User = require("../models/User");
const Task = require("../models/Task");
const Order = require("../models/Order");

const startOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const getTechnicianDashboard = async () => {
  const tasks = await Task.find({ assignedRole: "technician" }).sort({ createdAt: -1 }).limit(20);
  const today = startOfToday();

  return {
    stats: {
      pendingTasks: tasks.filter((t) => t.status === "pending").length,
      inProgressTasks: tasks.filter((t) => t.status === "in-progress").length,
      completedToday: tasks.filter((t) => t.completedAt && t.completedAt >= today).length,
      totalTasks: tasks.length,
    },
    tasks: tasks.map((task) => task.toJSON()),
  };
};

const getAdminDashboard = async () => {
  const [orders, pendingTasks, activeTechnicians, totalCustomers] = await Promise.all([
    Order.find({ status: { $ne: "cancelled" } }),
    Task.countDocuments({ status: { $in: ["pending", "in-progress"] } }),
    User.countDocuments({ role: "technician" }),
    User.countDocuments({ role: "customer" }),
  ]);

  const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    stats: {
      totalSales,
      totalOrders: orders.length,
      lowStockItems: 0,
      activeTechnicians,
      pendingTasks,
      totalCustomers,
    },
  };
};

const getSuperAdminDashboard = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [totalUsers, admins, technicians, customers, recentlyActiveUsers] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: { $in: ["admin", "superadmin"] } }),
    User.countDocuments({ role: "technician" }),
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ lastLogin: { $gte: oneDayAgo } }),
  ]);

  return {
    stats: {
      totalUsers,
      admins,
      technicians,
      customers,
      recentlyActiveUsers,
    },
  };
};

const getMyDashboard = async (req, res) => {
  const role = req.authUser.role;

  if (role === "technician") {
    return res.json({ role, ...(await getTechnicianDashboard()) });
  }

  if (role === "admin") {
    return res.json({ role, ...(await getAdminDashboard()) });
  }

  if (role === "superadmin") {
    return res.json({ role, ...(await getSuperAdminDashboard()) });
  }

  return res.json({
    role,
    stats: {
      message: "Customer dashboard uses storefront pages.",
    },
  });
};

module.exports = { getMyDashboard };
