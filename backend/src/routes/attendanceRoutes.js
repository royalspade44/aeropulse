const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  getMyTodayAttendance,
  upsertMyAttendance,
  getTodayAttendance,
  getAttendanceHistory,
  listAttendanceUsers,
  updateAttendanceRecord,
} = require("../controllers/attendanceController");

const router = express.Router();

router.use(requireAuth);

router.get("/me/today", getMyTodayAttendance);
router.post("/me", upsertMyAttendance);
router.get("/today", getTodayAttendance);
router.get("/history", getAttendanceHistory);
router.get("/users", listAttendanceUsers);
router.patch("/:attendanceId", updateAttendanceRecord);

module.exports = router;

