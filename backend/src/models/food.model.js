const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    media: { type: String, required: true },
    fileType: { type: String, enum: ["image", "non-image"], required: true },
    category: { type: String },
    foodPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodPartner"
    },
    likecount : { type: Number, default: 0 },
}, { timestamps: true });


const Food = mongoose.model("Food", foodSchema);

module.exports = Food;
