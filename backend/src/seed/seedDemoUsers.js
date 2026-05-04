const bcrypt = require("bcryptjs");
const connectDb = require("../config/db");
const User = require("../models/User");
const Order = require("../models/Order");

const users = [
  {
    email: "demo@example.com",
    password: "demo123",
    name: "Demo User",
    name_first: "Demo",
    name_last: "User",
    phone: "09123456789",
    address: "123 Demo Street, Molino I, Bacoor, Cavite, CALABARZON",
    billingAddress: {
      region: "CALABARZON",
      province: "Cavite",
      city: "Bacoor",
      barangay: "Molino I",
      street: "123 Demo Street",
    },
    addresses: [
      {
        label: "Billing Address",
        type: "home",
        name: "Demo User",
        phone: "09123456789",
        region: "CALABARZON",
        province: "Cavite",
        city: "Bacoor",
        barangay: "Molino I",
        street: "123 Demo Street",
        postalCode: "4102",
        isDefault: true,
      },
    ],
    role: "customer",
  },
  {
    email: "admin@example.com",
    password: "admin123",
    name: "Admin User",
    name_first: "Admin",
    name_last: "User",
    phone: "09123456780",
    address: "456 Admin Street",
    role: "admin",
    assignedBranch: "Bulacan",
    activeBranch: "Bulacan",
  },
  {
    email: "tech@example.com",
    password: "tech123",
    name: "Technician User",
    name_first: "Tech",
    name_last: "User",
    phone: "09123456781",
    address: "789 Tech Street",
    role: "technician",
    assignedBranch: "Bulacan",
    activeBranch: "Bulacan",
    skills: ["Electronics Repair", "AC Repair", "Plumbing"],
  },
  {
    email: "superadmin@example.com",
    password: "super123",
    name: "Super Admin",
    name_first: "Super",
    name_last: "Admin",
    phone: "09123456782",
    address: "999 Super Street",
    role: "superadmin",
  },
];

const seedDemoUsers = async () => {
  for (const item of users) {
    const exists = await User.findOne({ email: item.email });
    if (exists) {
      continue;
    }
    const passwordHash = await bcrypt.hash(item.password, 10);
    await User.create({ ...item, passwordHash });
  }
  console.log("Demo users seeded.");
};

module.exports = { seedDemoUsers };

if (require.main === module) {
  connectDb()
    .then(() => seedDemoUsers())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
