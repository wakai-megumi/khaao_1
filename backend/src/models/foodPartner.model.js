const mongoose = require("mongoose");

const foodPartnerSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    restaurantName: {type: String, required: true},
    contactName: {type: String, required: true},
    phone: {type: String, required: true},
    address: {type: String, required: true},
     

    
},
{
    timestamps: true
})

const foodPartnerModel = mongoose.model("FoodPartner", foodPartnerSchema);

module.exports = foodPartnerModel;
