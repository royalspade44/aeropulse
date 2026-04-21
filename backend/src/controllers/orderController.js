const Order = require("../models/Order");
const Product = require("../models/Product");
const { getBranchSearchOrder, resolvePreferredBranch } = require("../domain/branchRouting");

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
  const receiptNumber = `RCP-${Date.now()}`;
  const trackingNumber = `TRK-${Math.floor(Math.random() * 1000000000)}`;
  const eta = new Date();
  eta.setDate(eta.getDate() + 7);
  const installDate = new Date(eta);
  installDate.setDate(installDate.getDate() + 1);

  const preferredBranch = resolvePreferredBranch(address);
  const branchSearchOrder = getBranchSearchOrder(preferredBranch);
  const mutableProducts = [];
  const resolvedItems = [];

  for (const item of items) {
    const quantityNeeded = Number(item.quantity) || 0;
    if (!item.id || quantityNeeded < 1) {
      return res.status(400).json({ message: "Invalid cart item payload." });
    }

    const product = await Product.findById(item.id);
    if (!product) {
      return res.status(404).json({ message: `Product not found: ${item.name || item.id}` });
    }

    const selectedBranch = branchSearchOrder.find((branch) => {
      return Number(product.branchStock?.get(branch) || 0) >= quantityNeeded;
    });

    const hasBranchSnapshot = branchSearchOrder.some((branch) => Number(product.branchStock?.get(branch) || 0) > 0);
    const fallbackBranch = !hasBranchSnapshot && Number(product.stock || 0) >= quantityNeeded ? preferredBranch : null;
    const finalBranch = selectedBranch || fallbackBranch;

    if (!finalBranch) {
      return res.status(409).json({
        message: `Insufficient branch stock for ${product.name}. Tried preferred and nearby branches.`,
      });
    }

    const branchStock = Number(product.branchStock?.get(finalBranch) || 0);
    product.branchStock.set(finalBranch, Math.max(0, branchStock - quantityNeeded));
    product.stock = Math.max(0, Number(product.stock || 0) - quantityNeeded);
    mutableProducts.push(product);

    resolvedItems.push({
      productId: String(item.id || ""),
      name: item.name,
      price: item.price,
      quantity: quantityNeeded,
      specs: item.specs || "",
      sourceBranch: finalBranch,
    });
  }

  await Promise.all(mutableProducts.map((product) => product.save()));

  const assignedTechnician = preferredBranch ? `${preferredBranch} Technician Team` : "";
  const itemsSummary = resolvedItems.map((item) => `${item.name} x${item.quantity}`).join(", ");

  const order = await Order.create({
    orderCode,
    customer: user._id,
    customerName: user.name || `${user.name_first} ${user.name_last}`.trim(),
    items: resolvedItems,
    address,
    paymentMethod,
    trackingNumber,
    estimatedDelivery: eta.toISOString().split("T")[0],
    estimatedArrival: eta.toISOString(),
    installationDate: installDate.toISOString(),
    assignedTechnician,
    stockSourceBranch: preferredBranch,
    receipt: {
      receiptNumber,
      issuedAt: new Date().toISOString(),
      paymentMethod,
      amountPaid: Number(total) || 0,
      itemsSummary,
    },
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

const approveOrder = async (req, res) => {
  if (!["admin", "superadmin"].includes(req.authUser.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { orderId } = req.params;
  const { assignedTechnician, estimatedArrival, installationDate } = req.body || {};

  const baseQuery = { $or: [{ _id: orderId }, { orderCode: orderId }] };
  if (req.authUser.role !== "superadmin" && req.activeBranch) {
    baseQuery.stockSourceBranch = req.activeBranch;
  }
  const order = await Order.findOne(baseQuery);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.workflowStatus = "to_deliver";
  order.status = "paid";
  if (assignedTechnician) order.assignedTechnician = assignedTechnician;
  if (estimatedArrival) order.estimatedArrival = estimatedArrival;
  if (installationDate) order.installationDate = installationDate;
  await order.save();

  return res.json({
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

module.exports = { createOrder, listMyOrders, getMyOrderSummary, approveOrder };
