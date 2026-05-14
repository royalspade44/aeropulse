const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const productRoutes = require("./routes/productRoutes");
const reorderRoutes = require("./routes/reorderRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestRoutes");
const orderRoutes = require("./routes/orderRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const taskRoutes = require("./routes/taskRoutes");
const inventoryChangeRequestRoutes = require("./routes/inventoryChangeRequestRoutes");
const restockOrderRoutes = require("./routes/restockOrderRoutes");
const reportRoutes = require("./routes/reportRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reorders", reorderRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/inventory-change-requests", inventoryChangeRequestRoutes);
app.use("/api/restock-orders", restockOrderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);

const buildPath = path.resolve(__dirname, '..', '..', 'front', 'build');
const indexHtml = path.join(buildPath, 'index.html');

if (fs.existsSync(indexHtml)) {
  app.use(express.static(buildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(indexHtml);
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
