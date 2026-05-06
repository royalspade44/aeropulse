const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
	listTasks,
	createTask,
	updateTask,
	getTaskById,
	acceptTask,
	updateTaskStatus,
} = require("../controllers/taskController");

const router = express.Router();

router.use(requireAuth);
router.get("/", listTasks);
router.post("/", createTask);
router.get("/:taskId", getTaskById);
router.patch("/:taskId/accept", acceptTask);
router.patch("/:taskId", updateTask);
router.patch("/:taskId/status", updateTaskStatus);

module.exports = router;
