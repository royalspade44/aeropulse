const Attendance = require("../models/Attendance");

const dayKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const toView = (attendance, user) => {
  const json = attendance.toJSON();
  return {
    ...json,
    userName: user?.name || "",
    userEmail: user?.email || "",
  };
};

const getMyTodayAttendance = async (req, res) => {
  const day = dayKey();
  const attendance = await Attendance.findOne({ user: req.authUser._id, day });
  return res.json({ attendance: attendance ? toView(attendance, req.authUser) : null });
};

const upsertMyAttendance = async (req, res) => {
  const day = dayKey();
  const { status, branch = "", notes = "" } = req.body || {};

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const attendance = await Attendance.findOneAndUpdate(
    { user: req.authUser._id, day },
    {
      $set: {
        role: req.authUser.role,
        status,
        branch,
        notes,
      },
    },
    { new: true, upsert: true }
  );

  return res.json({ attendance: toView(attendance, req.authUser) });
};

const getTodayAttendance = async (req, res) => {
  if (req.authUser.role !== "superadmin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const day = dayKey();
  const attendance = await Attendance.find({ day }).populate("user").sort({ updatedAt: -1 });
  return res.json({
    attendance: attendance.map((a) => toView(a, a.user)),
  });
};

module.exports = { getMyTodayAttendance, upsertMyAttendance, getTodayAttendance };

