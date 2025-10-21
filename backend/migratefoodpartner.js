// migrateFoodPartner.js
require('dotenv').config();

const mongoose = require("mongoose");
const Food = require("./src/models/food.model.js");

const MONGO_URI = process.env.MONGODB_URI; // <- change to your DB


async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    const foods = await Food.find({}); // fetch all food items

    for (let food of foods) {
      // Check if foodPartner is a string and not an ObjectId
      if (typeof food.foodPartner === "string") {
        console.log(`Updating food: ${food._id}`);
        food.foodPartner = mongoose.Types.ObjectId(food.foodPartner);
        await food.save();
      }
    }

    console.log("Migration completed!");
    mongoose.disconnect();
  } catch (error) {
    console.error("Migration error:", error);
    mongoose.disconnect();
  }
}

migrate();
