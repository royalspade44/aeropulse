const User = require("../models/User");
const Task = require("../models/Task");
const Order = require("../models/Order");
const ServiceRequest = require("../models/ServiceRequest");

const startOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const getTechnicianDashboard = async (activeBranch = "") => {
  const taskQuery = { assignedRole: "technician" };
  if (activeBranch) {
    taskQuery.$or = [{ branch: activeBranch }, { branch: "" }, { branch: { $exists: false } }];
  }
  const tasks = await Task.find(taskQuery).sort({ createdAt: -1 }).limit(20);
  const today = startOfToday();

  return {
    stats: {
      pendingTasks: tasks.filter((t) => t.status === "pending").length,
      inProgressTasks: tasks.filter((t) => t.status === "in-progress").length,
      completedToday: tasks.filter((t) => t.completedAt && t.completedAt >= today).length,
      totalTasks: tasks.length,
      branchLabel: activeBranch || "All branches",
    },
    tasks: tasks.map((task) => task.toJSON()),
  };
};

const getAdminDashboard = async (activeBranch = "") => {
  const orderQuery = { status: { $ne: "cancelled" } };
  if (activeBranch) {
    orderQuery.stockSourceBranch = activeBranch;
  }
  const taskQuery = { status: { $in: ["pending", "in-progress"] } };
  const techQuery = { role: "technician" };
  const customerQuery = { role: "customer" };
  const serviceQuery = {};
  if (activeBranch) {
    taskQuery.$or = [{ branch: activeBranch }, { branch: "" }, { branch: { $exists: false } }];
    techQuery.$or = [{ assignedBranch: activeBranch }, { assignedBranch: "" }, { assignedBranch: { $exists: false } }];
    customerQuery.$or = [{ activeBranch }, { activeBranch: "" }, { activeBranch: { $exists: false } }];
    serviceQuery.$or = [{ branch: activeBranch }, { branch: "" }, { branch: { $exists: false } }];
  }

  const [orders, pendingTasks, activeTechnicians, totalCustomers, serviceRequests] = await Promise.all([
    Order.find(orderQuery),
    Task.countDocuments(taskQuery),
    User.countDocuments(techQuery),
    User.countDocuments(customerQuery),
    ServiceRequest.countDocuments(serviceQuery),
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
      serviceRequests,
      branchLabel: activeBranch || "All branches",
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
  try {
    const role = req.authUser.role;

    if (role === "technician") {
      return res.json({ role, ...(await getTechnicianDashboard(req.activeBranch)) });
    }

    if (role === "admin") {
      return res.json({ role, ...(await getAdminDashboard(req.activeBranch)) });
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
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    return res.status(500).json({ message: "Unable to load dashboard right now." });
  }
};

module.exports = { getMyDashboard };
