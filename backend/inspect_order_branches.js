const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const User = require('./src/models/User');
const connectDb = require('./src/config/db');

(async () => {
  try {
    await connectDb();
    const orders = await Order.find({ customerName: /andrei tupas/i }).limit(20);
    console.log('orders', orders.map(o => ({
      id: o.id,
      customerName: o.customerName,
      customerBranch: o.customerBranch,
      stockSourceBranch: o.stockSourceBranch,
      workflowStatus: o.workflowStatus,
      createdAt: o.createdAt,
    })));
    const admins = await User.find({ role: 'admin' }).limit(20);
    console.log('admins', admins.map(u => ({
      email: u.email,
      assignedBranch: u.assignedBranch,
      activeBranch: u.activeBranch,
    })));
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
