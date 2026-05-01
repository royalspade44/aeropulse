const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, unique: true, index: true },
    brand: { type: String, default: "" },
    category: { type: String, default: "split" },
    description: { type: String, default: "", trim: true },
    specs: { type: String, default: "" },
    features: [{ type: String }],
    image: { type: String, default: "", trim: true },
    stock: { type: Number, default: 0 },
    branchStock: {
      type: Map,
      of: Number,
      default: {},
    },
    threshold: { type: Number, default: 0 },
    branchThresholds: {
      type: Map,
      of: Number,
      default: {},
    },
    price: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

productSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Product", productSchema);

