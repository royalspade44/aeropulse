const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, required: true, index: true },
    day: { type: String, required: true, index: true }, // YYYY-MM-DD
    status: { type: String, required: true },
    branch: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, day: 1 }, { unique: true });

attendanceSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Attendance", attendanceSchema);

