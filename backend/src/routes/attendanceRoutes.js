const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  getMyTodayAttendance,
  upsertMyAttendance,
  getTodayAttendance,
} = require("../controllers/attendanceController");

const router = express.Router();

router.use(requireAuth);

router.get("/me/today", getMyTodayAttendance);
router.post("/me", upsertMyAttendance);
router.get("/today", getTodayAttendance);

module.exports = router;

