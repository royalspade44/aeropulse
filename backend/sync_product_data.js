const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./src/models/Product");

const DETAILED_PRODUCTS = [
  {
    sku: "AHAC-MINV1023EHW",
    name: "American Home Inverter",
    description: "Experience rapid cooling with American Home's advanced inverter technology. This unit provides consistent temperature control while significantly reducing power consumption.",
    features: ["Quiet Operation", "Rapid Cooling", "Energy Efficient Inverter", "Eco-Friendly Refrigerant"]
  },
  {
    sku: "AHAC-MINV1523EHW",
    name: "American Home Inverter",
    description: "A more powerful 1.5HP inverter unit designed for medium-sized residential spaces. Features optimized airflow and high-efficiency heat exchange.",
    features: ["Smart Flow", "Advanced Inverter", "Sleep Mode", "Auto-Restart"]
  },
  {
    sku: "TAC-10CSD-KEI-S-2",
    name: "TCL Full DC Inverter",
    description: "TCL's Full DC Inverter technology features T-AI cooling, allowing the unit to intelligently adjust its performance based on environmental conditions.",
    features: ["T-AI Cooling", "Full DC Inverter", "UVC Sterilization", "TitanGold Fins"]
  },
  {
    sku: "HSN30IPC",
    name: "LG Premium Dual Inverter",
    description: "The ultimate LG cooling solution. Dual Inverter compressors provide up to 70% energy savings and 40% faster cooling with full WiFi ThinQ integration.",
    features: ["ThinQ WiFi Control", "Dual Inverter Compressor", "Active Energy Control", "Smart Diagnosis"]
  },
  {
    sku: "TAC09-CWI-UJE2",
    name: "TCL Full DC Inverter Window",
    description: "A compact yet powerful window-type unit featuring TCL's signature full DC inverter for quiet, efficient environmental control.",
    features: ["Quiet Mode", "Full DC Inverter", "Smart WiFi Control", "Washable Filter"]
  },
  {
    sku: "53CNV030WTHP",
    name: "Carrier Opus Inverter Floor Type",
    description: "Premium floor-mounted unit featuring Carrier's Energenius technology. Designed for wide air distribution in large, open-plan spaces.",
    features: ["Energenius Technology", "Wide Angle Swing", "Intelligent Eye Sensor", "Industrial Grade Compressor"]
  }
  // ... can add more here or generic fallbacks
];

const sync = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/aeropulse");
    console.log("Connected to MongoDB for data sync.");

    const allProducts = await Product.find({});
    console.log(`Auditing ${allProducts.length} products...`);

    for (const product of allProducts) {
      // 1. Clean the name in the DB
      const cleanName = product.name.replace(/\s*AC\s*$/gi, "").trim();
      product.name = cleanName;

      // 2. Find detailed metadata
      const details = DETAILED_PRODUCTS.find(p => p.sku === product.sku);

      if (details) {
        product.description = details.description;
        product.features = details.features;
        console.log(`✅ Synced technical data for ${product.sku}`);
      } else {
        // Generic cleanup/fallback for others
        if (!product.description || product.description === "Energy efficient AC.") {
            product.description = `High-performance ${product.brand} ${product.category} unit with technical precision and consistent cooling.`;
        }
        if (product.features.length === 0) {
            product.features = ["Energy Efficient", "Quiet Operation", "Durable Build", "Professional Grade"];
        }
        console.log(`ℹ️ Applied generic technical meta for ${product.sku}`);
      }

      await product.save();
    }

    console.log("Database data sync complete.");
    process.exit(0);
  } catch (err) {
    console.error("Sync failed:", err);
    process.exit(1);
  }
};

sync();
