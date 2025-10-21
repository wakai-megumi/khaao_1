const mongoose = require("mongoose");

const savedFoodSchema = new mongoose.Schema({
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

const SavedFood = mongoose.model("SavedFood", savedFoodSchema);

module.exports = SavedFood;