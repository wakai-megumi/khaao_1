// create server
const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes.js");
const foodRoutes = require("./routes/food.routes.js");
const cors = require("cors");
 

const app = express();
app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true
    }
));
app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);

module.exports= app;
