const Order = require("../models/Order");
const Product = require("../models/Product");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const User = require("../models/User");
const mongoose = require("mongoose");
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

const normalizeAddress = (address = {}) => ({
  _id: String(address._id || address.id || "").trim(),
  label: String(address.label || "").trim(),
  type: String(address.type || "other").trim(),
  name: String(address.name || "").trim(),
  phone: String(address.phone || "").trim(),
  street: String(address.street || "").trim(),
  city: String(address.city || "").trim(),
  postalCode: String(address.postalCode || "").trim(),
  isDefault: Boolean(address.isDefault),
});

const isValidAddress = (address = {}) => {
  if (!address.name || !address.phone || !address.street || !address.city) return false;
  const phoneDigits = address.phone.replace(/\D/g, "");
  if (!/^09\d{9}$/.test(phoneDigits)) return false;
  if (address.postalCode && !/^\d{4}$/.test(address.postalCode)) return false;
  return true;
};

const resolveProductForOrderItem = async (item, session = null) => {
  const productId = String(item.id || "").trim();
  if (mongoose.Types.ObjectId.isValid(productId)) {
    const byId = await Product.findById(productId).session(session);
    if (byId) return byId;
  }
  const sku = String(item.model || item.sku || "").trim();
  if (sku) {
    const bySku = await Product.findOne({ sku }).session(session);
    if (bySku) return bySku;
  }
  return null;
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const createOrderNotification = async ({ customerId, title, message }) => {
  if (!customerId || !title || !message) return;
  try {
    const user = await User.findById(customerId).select("notifications");
    const notifications = user?.notifications?.toObject?.() || user?.notifications || {};
    if (notifications.inApp === false || notifications.push === false || notifications.orderUpdates === false) {
      return;
    }

    await Notification.create({
      user: customerId,
      type: "order",
      title,
      message,
      unread: true,
      status: "unread",
    });
  } catch (error) {
    console.error("Failed to create order notification:", error);
  }
};

const notifyBranchTechnicians = async (branch, orderCode) => {
  if (!branch || !orderCode) return;
  try {
    const technicians = await User.find({
      role: "technician",
      $or: [
        { assignedBranch: branch },
        { activeBranch: branch },
        { assignedBranch: "" },
        { activeBranch: "" },
      ],
    }).select("_id notifications");

    const validNotifications = technicians
      .filter((tech) => {
        const notifications = tech?.notifications?.toObject?.() || tech?.notifications || {};
        return notifications.inApp !== false && notifications.push !== false;
      })
      .map((tech) => ({
        user: tech._id,
        type: "system",
        title: "New technician task available",
        message: `A new task for order ${orderCode} is available in your task board.`,
        unread: true,
        status: "unread",
      }));

    if (validNotifications.length > 0) {
      await Notification.insertMany(validNotifications);
    }
  } catch (error) {
    console.error("Failed to notify technicians:", error);
  }
};

const createTaskForOrder = async (order) => {
  if (!order) return null;
  const existingTask = await Task.findOne({ "payload.orderId": order.id });
  if (existingTask) return existingTask;

  const branch = order.stockSourceBranch || "";
  const addressText = [order.address.street, order.address.city, order.address.postalCode]
    .filter(Boolean)
    .join(", ");

  const task = await Task.create({
    taskCode: `TSK-${Date.now()}`,
    title: `Fulfill ${order.orderCode}`,
    customer: order.customerName,
    address: addressText || order.address.name || "Customer address",
    customerId: String(order.customer || ""),
    customerEmail: "",
    customerPhone: String(order.address.phone || ""),
    unitId: "",
    unitName: `Order ${order.orderCode}`,
    unitType: "order",
    issueType: "Order Fulfillment",
    description: `Deliver and install items for order ${order.orderCode}.`,
    status: "pending",
    priority: "medium",
    scheduledDate: order.estimatedDelivery || new Date().toISOString().split("T")[0],
    timeSlot: "TBD",
    assignedRole: "technician",
    branch,
    payload: {
      orderId: order.id,
      orderCode: order.orderCode,
      items: order.items,
      customerAddress: order.address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });

  await notifyBranchTechnicians(branch, order.orderCode);
  return task;
};

const createOrder = async (req, res) => {
  const user = req.authUser;
  const { items = [], address = {}, addressId = "", paymentMethod = "cod", total = 0 } = req.body;
  const savedAddresses = Array.isArray(user.addresses) ? user.addresses.map((item) => normalizeAddress(item)) : [];
  const fallbackLegacyAddress = normalizeAddress({
    name: user.name || `${user.name_first || ""} ${user.name_last || ""}`.trim(),
    phone: user.phone || "",
    street: user.address || "",
    city: "",
    postalCode: "",
  });

  const normalizedAddress = (() => {
    const requestedId = String(addressId || address.id || address._id || "").trim();
    if (requestedId) {
      const matchedById = savedAddresses.find((item) => String(item._id || "") === requestedId);
      if (matchedById) return matchedById;
    }

    if (savedAddresses.length > 0) {
      const byPayload = normalizeAddress(address);
      const matchedByFields = savedAddresses.find(
        (item) =>
          item.street === byPayload.street &&
          item.city === byPayload.city &&
          item.phone === byPayload.phone &&
          item.name === byPayload.name
      );
      if (matchedByFields) return matchedByFields;
      const defaultAddress = savedAddresses.find((item) => item.isDefault);
      return defaultAddress || savedAddresses[0];
    }

    return fallbackLegacyAddress;
  })();

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order items are required." });
  }
  if (savedAddresses.length === 0) {
    return res.status(400).json({ message: "No delivery address found. Please add an address to proceed." });
  }
  if (!isValidAddress(normalizedAddress)) {
    return res.status(400).json({ message: "Invalid delivery address." });
  }

  const orderCode = `ORD-${Date.now()}`;
  const receiptNumber = `RCP-${Date.now()}`;
  const trackingNumber = `TRK-${Math.floor(Math.random() * 1000000000)}`;
  const eta = new Date();
  eta.setDate(eta.getDate() + 7);
  const installDate = new Date(eta);
  installDate.setDate(installDate.getDate() + 1);

  const preferredBranch = resolvePreferredBranch(normalizedAddress);
  const branchSearchOrder = getBranchSearchOrder(preferredBranch);
  const assignedTechnician = preferredBranch ? `${preferredBranch} Technician Team` : "";

  const attemptCreateOrder = async () => {
    const session = await mongoose.startSession();
    try {
      let createdOrder = null;
      await session.withTransaction(async () => {
        const mutableProducts = [];
        const resolvedItems = [];

        for (const item of items) {
          const quantityNeeded = Number(item.quantity) || 0;
          if (quantityNeeded < 1) {
            throw new HttpError(400, "Invalid cart item payload.");
          }

          const product = await resolveProductForOrderItem(item, session);
          if (!product) {
            throw new HttpError(404, `Product not found: ${item.name || item.id || item.model}`);
          }

          const selectedBranch = branchSearchOrder.find((branch) => {
            return Number(product.branchStock?.get(branch) || 0) >= quantityNeeded;
          });

          const hasBranchSnapshot = branchSearchOrder.some((branch) => Number(product.branchStock?.get(branch) || 0) > 0);
          const fallbackBranch = !hasBranchSnapshot && Number(product.stock || 0) >= quantityNeeded ? preferredBranch : null;
          const finalBranch = selectedBranch || fallbackBranch;

          if (!finalBranch) {
            throw new HttpError(
              409,
              `Insufficient branch stock for ${product.name}. Tried preferred and nearby branches.`
            );
          }

          const currentBranchStock = Number(product.branchStock?.get(finalBranch) || 0);
          const remainingBranchStock = hasBranchSnapshot
            ? Math.max(0, currentBranchStock - quantityNeeded)
            : Math.max(0, Number(product.stock || 0) - quantityNeeded);
          product.branchStock.set(finalBranch, remainingBranchStock);
          product.stock = Array.from(product.branchStock.values()).reduce((sum, val) => sum + Number(val || 0), 0);
          mutableProducts.push(product);

          resolvedItems.push({
            productId: String(product.id || ""),
            name: item.name || product.name,
            price: Number(item.price) || Number(product.price || 0),
            quantity: quantityNeeded,
            specs: item.specs || product.specs || "",
            sourceBranch: finalBranch,
          });
        }

        await Promise.all(mutableProducts.map((product) => product.save({ session })));

        const itemsSummary = resolvedItems.map((item) => `${item.name} x${item.quantity}`).join(", ");

        createdOrder = await Order.create(
          [
            {
              orderCode,
              customer: user._id,
              customerName: user.name || `${user.name_first} ${user.name_last}`.trim(),
              items: resolvedItems,
              address: normalizedAddress,
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
            },
          ],
          { session }
        );
      });

      return Array.isArray(createdOrder) ? createdOrder[0] : createdOrder;
    } finally {
      await session.endSession();
    }
  };

  const isRetryableTransactionError = (error) => {
    const message = String(error?.message || "");
    return message.includes("WriteConflict") || message.includes("TransientTransactionError");
  };

  try {
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const order = await attemptCreateOrder();
        await createOrderNotification({
          customerId: user._id,
          title: "Order received",
          message: `Your order ${order.orderCode} has been received and is now pending approval. You can track its status in My Orders.`,
        });
        return res.status(201).json({
          order: {
            ...order.toJSON(),
            workflowLabel: workflowLabel(order.workflowStatus),
          },
        });
      } catch (error) {
        if (error instanceof HttpError) {
          return res.status(error.status).json({ message: error.message });
        }
        lastError = error;
        if (!isRetryableTransactionError(error)) break;
      }
    }
    console.error("Failed to create order:", lastError);
    return res.status(500).json({ message: "Unable to create order right now." });
  } catch (error) {
    console.error("Failed to create order:", error);
    return res.status(500).json({ message: "Unable to create order right now." });
  }
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

  await createTaskForOrder(order);

  await createOrderNotification({
    customerId: order.customer,
    title: "Order approved",
    message: `Your order ${order.orderCode} has been approved and is now queued for delivery scheduling.`,
  });

  return res.json({
    order: {
      ...order.toJSON(),
      workflowLabel: workflowLabel(order.workflowStatus),
    },
  });
};

const listMyOrders = async (req, res) => {
  res.set("Cache-Control", "no-store");
  const orders = await Order.find({ customer: req.authUser._id }).sort({ createdAt: -1 });
  console.log("List my orders", {
    userId: String(req.authUser._id),
    count: Number(orders.length || 0),
  });
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

const listOrdersForAdmin = async (req, res) => {
  if (!["admin", "superadmin"].includes(req.authUser.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const query = {};
  const orders = await Order.find(query).sort({ createdAt: -1 });
  return res.json({
    orders: orders.map((order) => ({
      ...order.toJSON(),
      workflowLabel: workflowLabel(order.workflowStatus),
    })),
  });
};

const processOrder = async (req, res) => {
  if (!["admin", "superadmin"].includes(req.authUser.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { orderId } = req.params;
  const { action = "approve" } = req.body || {};
  const query = { $or: [{ _id: orderId }, { orderCode: orderId }] };
  if (req.authUser.role !== "superadmin" && req.activeBranch) {
    query.stockSourceBranch = req.activeBranch;
  }
  const order = await Order.findOne(query);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (action === "approve") {
    order.workflowStatus = "to_deliver";
    order.status = "paid";
  } else if (action === "dispatch") {
    order.workflowStatus = "to_install";
    order.status = "paid";
  } else if (action === "complete") {
    order.workflowStatus = "complete";
    order.status = "paid";
  } else if (action === "cancel") {
    order.workflowStatus = "cancelled";
    order.status = "cancelled";
  } else {
    return res.status(400).json({ message: "Invalid action." });
  }

  await order.save();

  if (action === "approve") {
    await createTaskForOrder(order);
    await createOrderNotification({
      customerId: order.customer,
      title: "COD approved",
      message: `Your payment for order ${order.orderCode} was approved. Your order is now in TO DELIVER stage.`,
    });
  } else if (action === "dispatch") {
    await createOrderNotification({
      customerId: order.customer,
      title: "Order dispatched",
      message: `Your order ${order.orderCode} is on the way and moved to TO INSTALL stage.`,
    });
  } else if (action === "complete") {
    await createOrderNotification({
      customerId: order.customer,
      title: "Order completed",
      message: `Your order ${order.orderCode} has been completed. Thank you for choosing AeroPulse.`,
    });
  } else if (action === "cancel") {
    await createOrderNotification({
      customerId: order.customer,
      title: "Order cancelled",
      message: `Your order ${order.orderCode} has been cancelled. Please contact support if you need assistance.`,
    });
  }

  return res.json({
    order: {
      ...order.toJSON(),
      workflowLabel: workflowLabel(order.workflowStatus),
    },
  });
};

module.exports = {
  createOrder,
  listMyOrders,
  getMyOrderSummary,
  approveOrder,
  listOrdersForAdmin,
  processOrder,
};
