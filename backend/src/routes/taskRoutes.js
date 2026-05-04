const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
	listTasks,
	createTask,
	updateTask,
	getTaskById,
	updateTaskStatus,
} = require("../controllers/taskController");

const router = express.Router();

router.use(requireAuth);
router.get("/", listTasks);
router.post("/", createTask);
router.get("/:taskId", getTaskById);
router.patch("/:taskId", updateTask);
router.patch("/:taskId/status", updateTaskStatus);

module.exports = router;
