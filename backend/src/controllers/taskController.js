const mongoose = require("mongoose");
const Task = require("../models/Task");

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

const getTaskById = async (req, res) => {
  try {
    const task = await findTaskForRequest(req.params.taskId, req);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.json({ task: task.toJSON() });
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return res.status(500).json({ message: "Unable to fetch task right now." });
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

    return res.json({ task: task.toJSON() });
  } catch (error) {
    console.error("Failed to update task status:", error);
    return res.status(500).json({ message: "Unable to update task status right now." });
  }
};

module.exports = { getTaskById, updateTaskStatus };
