const ServiceRequest = require("../models/ServiceRequest");

const requireAdmin = (req, res) => {
  if (req.authUser.role !== "admin" && req.authUser.role !== "superadmin") {
    res.status(403).json({ message: "Forbidden" });
    return false;
  }
  return true;
};

const listServiceRequests = async (req, res) => {
  if (!requireAdmin(req, res)) return null;
  const requests = await ServiceRequest.find({}).sort({ createdAt: -1 }).limit(200);
  return res.json({ requests: requests.map((r) => r.toJSON()) });
};

const createServiceRequest = async (req, res) => {
  if (!requireAdmin(req, res)) return null;
  const { customer, issue, address, status = "Pending" } = req.body || {};
  if (!customer || !issue || !address) {
    return res.status(400).json({ message: "customer, issue, and address are required" });
  }
  const request = await ServiceRequest.create({
    customer,
    issue,
    address,
    status,
    createdBy: req.authUser._id,
  });
  return res.status(201).json({ request: request.toJSON() });
};

module.exports = { listServiceRequests, createServiceRequest };

