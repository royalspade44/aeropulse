const Task = require("../models/Task");

const findTaskForRequest = async (taskId) => {
  return Task.findOne({
    $or: [{ _id: taskId }, { taskCode: taskId }],
  });
};

const getTaskById = async (req, res) => {
  const task = await findTaskForRequest(req.params.taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  return res.json({ task: task.toJSON() });
};

const updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "in-progress", "completed"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid task status." });
  }

  const task = await findTaskForRequest(req.params.taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  task.status = status;
  task.completedAt = status === "completed" ? new Date() : null;
  await task.save();

  return res.json({ task: task.toJSON() });
};

module.exports = { getTaskById, updateTaskStatus };
