const jwt = require("jsonwebtoken");
const foodPartnerModel = require("../models/foodPartner.model");
const User = require("../models/user.model");

const authFoodPartner = async (req, res, next) => {
  try {
    const token = req.cookies.foodPartnerToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ❗ will throw if expired

    const foodPartner = await foodPartnerModel.findById(decoded.id);
    if (!foodPartner) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Remove password manually
    req.foodPartner = foodPartner.toObject();
    delete req.foodPartner.password;

    next();
  } catch (error) {
    console.log(error, "error in auth middleware");
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const authUserMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user.toObject();
    delete req.user.password;

    next();
  } catch (error) {
    console.log(error, "error in auth user middleware");
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { authFoodPartner, authUserMiddleware };
