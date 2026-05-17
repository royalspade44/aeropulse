const mongoose = require("mongoose");
const https = require("https");
require("dotenv").config();
const Product = require("./src/models/Product");

const BRAND_LOGOS = {
  "Midea": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvl2GSFigO4nNXMWW1qO_VZ1GZwjVl5alpsw&s",
  "TCL": "https://cdn.manilastandard.net/wp-content/uploads/2023/02/TCL.png",
  "Aux": "https://auxaircon.com.ph/images/aux_logo.png",
  "Samsung": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXFVQh2BQhYtWf9APXNliSnNTi7MBwV6yPFA&s",
  "Daikin": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwu8SCQH4joBnn0HXF5F_HQKBRb85KZ8ZkuA&s",
  "Carrier": "https://upload.wikimedia.org/wikipedia/commons/8/8f/Logo_of_the_Carrier_Corporation.svg",
  "LG": "https://www.lg.com/content/dam/lge/common/logo/logo-lg-100-44.jpg",
  "American Home": "https://ansons.ph/wp-content/uploads/2024/05/aham.jpg",
  "Gree": "https://1000logos.net/wp-content/uploads/2018/08/Gree-Logo.png"
};

const PRODUCT_IMAGE_FALLBACKS = {
  "American Home": "https://ansons.ph/wp-content/uploads/2024/12/29_AHAC-MINV1023EHW.jpg",
  "TCL": "https://d1rlzxa98cyc61.cloudfront.net/catalog/product/1/9/196330_4.jpg?auto=webp&format=pjpg&width=640",
  "Midea": "https://www.remalsales.com/assets/images/aircon%202024/msce_crfn8.png",
  "Carrier": "https://ansons.ph/wp-content/uploads/2023/02/Opus.jpg"
};

const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode}`));
        return;
      }
      const data = [];
      res.on("data", (chunk) => data.push(chunk));
      res.on("end", () => {
        resolve({
          buffer: Buffer.concat(data),
          contentType: res.headers["content-type"] || "image/jpeg"
        });
      });
    }).on("error", reject);
  });
};

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/aeropulse");
    console.log("Connected to MongoDB.");

    const products = await Product.find({});
    console.log(`Found ${products.length} products to update.`);

    for (const product of products) {
      console.log(`Processing ${product.brand} - ${product.sku}...`);

      try {
        // 1. Handle Brand Logo (if we wanted to store it per product, but for now we store product images)
        // Actually the user wants "The logo PNGs should be in the database"
        // and "image blobs are what are returned by the server".

        // 2. Handle Product Image
        const imageUrl = product.image || PRODUCT_IMAGE_FALLBACKS[product.brand] || PRODUCT_IMAGE_FALLBACKS["Generic"];

        if (imageUrl && imageUrl.startsWith("http")) {
          const { buffer, contentType } = await downloadImage(imageUrl);
          product.imageData = buffer;
          product.imageContentType = contentType;
          await product.save();
          console.log(`✅ Updated image for ${product.sku}`);
        } else {
          console.log(`⚠️ No URL for ${product.sku}, skipping.`);
        }
      } catch (err) {
        console.error(`❌ Failed to process ${product.sku}: ${err.message}`);
      }
    }

    console.log("Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrate();
