const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getTaskById, updateTaskStatus } = require("../controllers/taskController");

const router = express.Router();

router.use(requireAuth);
router.get("/:taskId", getTaskById);
router.patch("/:taskId/status", updateTaskStatus);

module.exports = router;
