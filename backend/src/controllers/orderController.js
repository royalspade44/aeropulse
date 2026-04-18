const Order = require("../models/Order");

const workflowLabel = (status) => {
  switch (status) {
    case "to_pay":
      return "TO PAY";
    case "to_deliver":
      return "TO DELIVER";
    case "to_install":
      return "TO INSTALL";
    case "complete":
      return "COMPLETE";
    default:
      return "CANCELLED";
  }
};

const createOrder = async (req, res) => {
  const user = req.authUser;
  const { items = [], address = {}, paymentMethod = "cod", total = 0 } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order items are required." });
  }

  const orderCode = `ORD-${Date.now()}`;
  const trackingNumber = `TRK-${Math.floor(Math.random() * 1000000000)}`;
  const eta = new Date();
  eta.setDate(eta.getDate() + 7);

  const order = await Order.create({
    orderCode,
    customer: user._id,
    customerName: user.name || `${user.name_first} ${user.name_last}`.trim(),
    items: items.map((item) => ({
      productId: String(item.id || ""),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      specs: item.specs || "",
    })),
    address,
    paymentMethod,
    trackingNumber,
    estimatedDelivery: eta.toISOString().split("T")[0],
    totalAmount: total,
    workflowStatus: "to_pay",
    status: "pending",
  });

  return res.status(201).json({
    order: {
      ...order.toJSON(),
      workflowLabel: workflowLabel(order.workflowStatus),
    },
  });
};

const listMyOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.authUser._id }).sort({ createdAt: -1 });
  return res.json({
    orders: orders.map((order) => ({
      ...order.toJSON(),
      workflowLabel: workflowLabel(order.workflowStatus),
    })),
  });
};

const getMyOrderSummary = async (req, res) => {
  const orders = await Order.find({ customer: req.authUser._id });
  const summary = {
    toPay: 0,
    toDeliver: 0,
    toInstall: 0,
    complete: 0,
  };

  orders.forEach((order) => {
    if (order.workflowStatus === "to_pay") summary.toPay += 1;
    if (order.workflowStatus === "to_deliver") summary.toDeliver += 1;
    if (order.workflowStatus === "to_install") summary.toInstall += 1;
    if (order.workflowStatus === "complete") summary.complete += 1;
  });

  return res.json({ summary });
};

module.exports = { createOrder, listMyOrders, getMyOrderSummary };
