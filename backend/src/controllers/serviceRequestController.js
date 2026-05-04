const ServiceRequest = require("../models/ServiceRequest");

const normalizeStatus = (value = "") => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "Pending";
  if (normalized === "in progress") return "In Progress";
  if (normalized === "submitted") return "Submitted";
  if (normalized === "reviewed") return "Reviewed";
  if (normalized === "assigned") return "Assigned";
  if (normalized === "completed") return "Completed";
  if (normalized === "cancelled") return "Cancelled";
  return normalized.replace(/^\w/, (c) => c.toUpperCase());
};

const hydrateRequestResponse = (request) => {
  const payload = request.payload && Object.keys(request.payload).length ? request.payload : null;
  if (!payload) return request.toJSON();
  return {
    ...payload,
    id: request.id,
    status: payload.status || request.status,
    createdAt: payload.createdAt || request.createdAt,
    updatedAt: payload.updatedAt || request.updatedAt,
  };
};

const requireAdmin = (req, res) => {
  if (req.authUser.role !== "admin" && req.authUser.role !== "superadmin") {
    res.status(403).json({ message: "Forbidden" });
    return false;
  }
  return true;
};

const listServiceRequests = async (req, res) => {
  if (!requireAdmin(req, res)) return null;
  const query = req.authUser.role === "superadmin"
    ? {}
    : { $or: [{ branch: req.activeBranch }, { branch: "" }, { branch: { $exists: false } }] };
  const requests = await ServiceRequest.find(query).sort({ createdAt: -1 }).limit(200);
  return res.json({ requests: requests.map(hydrateRequestResponse) });
};

const createServiceRequest = async (req, res) => {
  if (!requireAdmin(req, res)) return null;
  const { customer, issue, address, status = "Pending" } = req.body || {};
  if (!customer || !issue || !address) {
    return res.status(400).json({ message: "customer, issue, and address are required" });
  }
  const nowIso = new Date().toISOString();
  const request = await ServiceRequest.create({
    customer,
    issue,
    address,
    branch: req.authUser.role === "superadmin" ? (req.body?.branch || "") : req.activeBranch,
    status: normalizeStatus(status),
    customerId: String(req.body?.customerId || req.body?.userId || ""),
    customerEmail: String(req.body?.customerEmail || ""),
    customerPhone: String(req.body?.customerPhone || ""),
    unitId: String(req.body?.unitId || ""),
    unitName: String(req.body?.unitName || ""),
    issueType: String(req.body?.issueType || ""),
    assignedTechnicianId: String(req.body?.assignedTechnicianId || ""),
    assignedTechnicianName: String(req.body?.assignedTechnicianName || ""),
    payload: { ...req.body, createdAt: req.body?.createdAt || nowIso, updatedAt: req.body?.updatedAt || nowIso },
    createdBy: req.authUser._id,
  });
  return res.status(201).json({ request: hydrateRequestResponse(request) });
};

const listMyServiceRequests = async (req, res) => {
  const requests = await ServiceRequest.find({ createdBy: req.authUser._id })
    .sort({ createdAt: -1 })
    .limit(200);
  return res.json({ requests: requests.map(hydrateRequestResponse) });
};

const createMyServiceRequest = async (req, res) => {
  const payload = req.body || {};
  const customerName = String(payload.customerName || payload.customer || req.authUser.name || "").trim();
  const issue = String(payload.issueDescription || payload.issue || payload.concern || "").trim();
  const address = String(payload.address || "").trim();

  if (!customerName || !issue || !address) {
    return res.status(400).json({ message: "customer, issue, and address are required" });
  }

  const nowIso = new Date().toISOString();
  const request = await ServiceRequest.create({
    customer: customerName,
    issue,
    address,
    branch: req.authUser.role === "superadmin" ? (payload.branch || "") : req.activeBranch,
    status: normalizeStatus(payload.status || "Submitted"),
    customerId: String(payload.customerId || payload.userId || req.authUser._id || ""),
    customerEmail: String(payload.customerEmail || req.authUser.email || ""),
    customerPhone: String(payload.customerPhone || req.authUser.phone || ""),
    unitId: String(payload.unitId || ""),
    unitName: String(payload.unitName || ""),
    issueType: String(payload.issueType || payload.serviceType || ""),
    assignedTechnicianId: String(payload.assignedTechnicianId || ""),
    assignedTechnicianName: String(payload.assignedTechnicianName || ""),
    payload: { ...payload, createdAt: payload.createdAt || nowIso, updatedAt: payload.updatedAt || nowIso },
    createdBy: req.authUser._id,
  });

  return res.status(201).json({ request: hydrateRequestResponse(request) });
};

const updateServiceRequestStatus = async (req, res) => {
  const { id } = req.params;
  const nextStatus = normalizeStatus(req.body?.status || "");

  const request = await ServiceRequest.findById(id);
  if (!request) {
    return res.status(404).json({ message: "Service request not found" });
  }

  const role = req.authUser.role;
  if (role === "customer" || role === "technician") {
    const isOwner = String(request.createdBy || "") === String(req.authUser._id || "");
    if (!isOwner && role === "customer") {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (role === "customer" && nextStatus !== "Cancelled") {
      return res.status(403).json({ message: "Customers can only cancel requests." });
    }
  }

  request.status = nextStatus || request.status;
  request.assignedTechnicianId = String(req.body?.assignedTechnicianId || request.assignedTechnicianId || "");
  request.assignedTechnicianName = String(req.body?.assignedTechnicianName || request.assignedTechnicianName || "");
  request.payload = {
    ...(request.payload || {}),
    ...req.body,
    status: req.body?.status || request.status,
    updatedAt: new Date().toISOString(),
  };

  await request.save();
  return res.json({ request: hydrateRequestResponse(request) });
};

module.exports = {
  listServiceRequests,
  createServiceRequest,
  listMyServiceRequests,
  createMyServiceRequest,
  updateServiceRequestStatus,
};

