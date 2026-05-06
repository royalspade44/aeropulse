const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");
const { BRANCH_PRIORITY } = require("../domain/branchRouting");

const branchScopeQuery = (req) => {
  if (req.authUser.role === "superadmin") return {};
  const branch = req.activeBranch;
  if (!branch) return {};
  return { $or: [{ branch }, { branch: "" }, { branch: { $exists: false } }] };
};

const findTaskForRequest = async (taskId, req) => {
  const conditions = [{ taskCode: taskId }];
  if (mongoose.Types.ObjectId.isValid(taskId)) {
    conditions.unshift({ _id: taskId });
  }
  return Task.findOne({ $and: [{ $or: conditions }, branchScopeQuery(req)] });
};

const normalizeStatus = (value = "") => {
  const normalized = String(value || "").toLowerCase().replace(" ", "-");
  if (["pending", "in-progress", "completed"].includes(normalized)) return normalized;
  if (normalized === "in_progress") return "in-progress";
  return "pending";
};

const isBranchNearby = (taskBranch = "", techBranch = "") => {
  const branch = String(taskBranch || "").trim();
  const technicianBranch = String(techBranch || "").trim();
  if (!branch || !technicianBranch) return false;
  if (branch === technicianBranch) return true;
  const order = BRANCH_PRIORITY[branch] || [];
  const index = order.indexOf(technicianBranch);
  return index >= 0 && index <= 2;
};

const canTechnicianAcceptTask = (task, technician) => {
  if (!task || !technician) return false;
  const assignedTechId = String(task.assignedTechnicianId || "");
  const currentTechId = String(technician._id || "");
  if (assignedTechId && assignedTechId !== currentTechId) return false;
  const taskBranch = String(task.branch || "").trim();
  if (!taskBranch) return true;
  if (taskBranch === String(technician.assignedBranch || "").trim()) return true;
  if (taskBranch === String(technician.activeBranch || "").trim()) return true;
  return isBranchNearby(task.branch, technician.assignedBranch) || isBranchNearby(task.branch, technician.activeBranch);
};

const hydrateTaskResponse = (task) => {
  const payload = task.payload && Object.keys(task.payload).length ? task.payload : null;
  if (!payload) return task.toJSON();

  return {
    ...payload,
    id: task.id,
    status: payload.status || task.status,
    createdAt: payload.createdAt || task.createdAt,
    updatedAt: payload.updatedAt || task.updatedAt,
  };
};

const listTasks = async (req, res) => {
  try {
    const role = req.authUser.role;
    const technicianId = String(req.query?.technician_id || "").trim();
    const scopeQuery = branchScopeQuery(req);
    let query = { ...scopeQuery };

    if (role === "technician") {
      query = {
        $and: [
          scopeQuery,
          {
            $or: [
              { assignedTechnicianId: String(req.authUser._id || "") },
              { assignedTechnicianId: "" },
            ],
          },
        ],
      };
    } else if (technicianId) {
      query.assignedTechnicianId = technicianId;
    }

    const tasks = await Task.find(query).sort({ updatedAt: -1 }).limit(200);
    return res.json({ tasks: tasks.map(hydrateTaskResponse) });
  } catch (error) {
    console.error("Failed to list tasks:", error);
    return res.status(500).json({ message: "Unable to fetch tasks right now." });
  }
};

const createTask = async (req, res) => {
  try {
    if (!["admin", "superadmin"].includes(req.authUser.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const payload = req.body || {};
    const nowIso = new Date().toISOString();
    const taskCode = String(payload.taskCode || `TSK-${Date.now()}`).trim();
    const title = String(payload.title || payload.issueType || "Service Task").trim();
    const customerName = String(payload.customerName || payload.customer || "Customer").trim();
    const address = String(payload.address || "TBD").trim();

    const task = await Task.create({
      taskCode,
      title,
      customer: customerName || "Customer",
      address,
      customerId: String(payload.customerId || payload.userId || ""),
      customerEmail: String(payload.customerEmail || ""),
      customerPhone: String(payload.customerPhone || ""),
      unitId: String(payload.unitId || ""),
      unitName: String(payload.unitName || ""),
      unitType: String(payload.unitType || ""),
      issueType: String(payload.issueType || ""),
      description: String(payload.description || payload.concern || ""),
      assignedTechnicianId: String(payload.assignedTechnicianId || ""),
      assignedTechnicianName: String(payload.assignedTechnicianName || ""),
      status: normalizeStatus(payload.status),
      priority: String(payload.priority || "medium").toLowerCase(),
      scheduledDate: String(payload.scheduledDate || payload.preferredDate || "TBD"),
      timeSlot: String(payload.timeSlot || payload.preferredSchedule || "TBD"),
      assignedRole: String(payload.assignedRole || "technician"),
      branch: req.authUser.role === "superadmin" ? String(payload.branch || "") : req.activeBranch,
      completedAt: normalizeStatus(payload.status) === "completed" ? new Date() : null,
      payload: { ...payload, createdAt: payload.createdAt || nowIso, updatedAt: payload.updatedAt || nowIso },
    });

    return res.status(201).json({ task: hydrateTaskResponse(task) });
  } catch (error) {
    console.error("Failed to create task:", error);
    return res.status(500).json({ message: "Unable to create task right now." });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await findTaskForRequest(req.params.taskId, req);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.authUser.role === "technician" && String(task.assignedTechnicianId || "") !== String(req.authUser._id || "")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const payload = req.body || {};
    const nextStatus = normalizeStatus(payload.status || task.status);
    const updatedPayload = {
      ...(task.payload || {}),
      ...payload,
      status: payload.status || task.status,
      updatedAt: new Date().toISOString(),
    };

    task.title = String(payload.title || task.title || "Service Task").trim();
    task.customer = String(payload.customerName || payload.customer || task.customer || "Customer").trim();
    task.address = String(payload.address || task.address || "TBD").trim();
    task.customerId = String(payload.customerId || payload.userId || task.customerId || "");
    task.customerEmail = String(payload.customerEmail || task.customerEmail || "");
    task.customerPhone = String(payload.customerPhone || task.customerPhone || "");
    task.unitId = String(payload.unitId || task.unitId || "");
    task.unitName = String(payload.unitName || task.unitName || "");
    task.unitType = String(payload.unitType || task.unitType || "");
    task.issueType = String(payload.issueType || task.issueType || "");
    task.description = String(payload.description || payload.concern || task.description || "");
    task.assignedTechnicianId = String(payload.assignedTechnicianId || task.assignedTechnicianId || "");
    task.assignedTechnicianName = String(payload.assignedTechnicianName || task.assignedTechnicianName || "");
    task.status = nextStatus;
    task.priority = String(payload.priority || task.priority || "medium").toLowerCase();
    task.scheduledDate = String(payload.scheduledDate || payload.preferredDate || task.scheduledDate || "TBD");
    task.timeSlot = String(payload.timeSlot || payload.preferredSchedule || task.timeSlot || "TBD");
    task.completedAt = nextStatus === "completed" ? new Date() : null;
    task.payload = updatedPayload;

    await task.save();
    return res.json({ task: hydrateTaskResponse(task) });
  } catch (error) {
    console.error("Failed to update task:", error);
    return res.status(500).json({ message: "Unable to update task right now." });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await findTaskForRequest(req.params.taskId, req);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.json({ task: hydrateTaskResponse(task) });
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return res.status(500).json({ message: "Unable to fetch task right now." });
  }
};

const acceptTask = async (req, res) => {
  try {
    if (req.authUser.role !== "technician") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const task = await findTaskForRequest(req.params.taskId, req);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const technician = await User.findById(req.authUser._id).select("assignedBranch activeBranch name name_first name_last");
    if (!canTechnicianAcceptTask(task, technician)) {
      return res.status(403).json({ message: "You are not authorized to accept this task." });
    }

    const currentTechId = String(technician._id || "");
    if (task.assignedTechnicianId && String(task.assignedTechnicianId) !== currentTechId) {
      return res.status(403).json({ message: "Task already accepted by another technician." });
    }

    task.assignedTechnicianId = currentTechId;
    task.assignedTechnicianName = technician.name || `${technician.name_first || ""} ${technician.name_last || ""}`.trim() || "Technician";
    if (task.status === "pending") {
      task.status = "in-progress";
    }
    task.payload = {
      ...(task.payload || {}),
      acceptedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await task.save();
    return res.json({ task: hydrateTaskResponse(task) });
  } catch (error) {
    console.error("Failed to accept task:", error);
    return res.status(500).json({ message: "Unable to accept task right now." });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "in-progress", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid task status." });
    }

    const task = await findTaskForRequest(req.params.taskId, req);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = status;
    task.completedAt = status === "completed" ? new Date() : null;
    await task.save();

    return res.json({ task: hydrateTaskResponse(task) });
  } catch (error) {
    console.error("Failed to update task status:", error);
    return res.status(500).json({ message: "Unable to update task status right now." });
  }
};

module.exports = {
  listTasks,
  createTask,
  updateTask,
  getTaskById,
  acceptTask,
  updateTaskStatus,
};
