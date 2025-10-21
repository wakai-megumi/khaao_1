const mongoose = require("mongoose");

function connectToDB(){
    try {
        mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Mongoose connection successful");
    } catch (error) {
        console.log("Mongoose connection error",error);
    }
}

module.exports = connectToDB;
