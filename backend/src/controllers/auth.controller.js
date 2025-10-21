const User = require("../models/user.model.js");
const FoodPartner = require("../models/foodPartner.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const isUserExist = await User.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ fullName, email, password: hashedPassword });
        //
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("token", token);
        //
        return res.status(201).json({ user: {
            fullName,
            email,
            _id: user._id
        }, message: "User registered successfully" });

    } catch (error) {
        console.log(error, "error at register controller");
        return res.status(500).json({ message: error.message, success: false });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("token", token);
        return res.status(200).json({ user: {
            fullName: user.fullName,
            email: user.email,
            _id: user._id
        }, message: "User logged in successfully" });

    } catch (error) {
        console.log(error, "error at login controller");
        return res.status(500).json({ message: error.message, success: false });
    }

};

const logout = (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.log(error, "error at logout controller");
        return res.status(500).json({ message: error.message, success: false });
    }
};
// food partner

const registerFoodPartner = async (req, res) => {
    try {
        const {email, password, restaurantName, contactName, phone, address } = req.body;
        const isUserExist = await FoodPartner.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const foodPartner = await FoodPartner.create({ email, password: hashedPassword, restaurantName, contactName, phone, address });
        //
        const token = jwt.sign({ id: foodPartner._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("foodPartnerToken", token);
        //
        return res.status(201).json({ foodPartner: {
            email,
            restaurantName,
            contactName,
            phone,
            address,
            _id: foodPartner._id
        }, message: "Food Partner registered successfully" });

    } catch (error) {
        console.log(error, "error at register food partner controller");
        return res.status(500).json({ message: error.message, success: false });
    }
}

const loginFoodPartner = async (req, res) => {
    try {
        const { email, password } = req.body;
        const foodPartner = await FoodPartner.findOne({ email });
        if (!foodPartner) {
            return res.status(400).json({ message: "Invalid credentials" });
        }   
        const isPasswordMatched = await bcrypt.compare(password, foodPartner.password);
        if (!isPasswordMatched) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: foodPartner._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("foodPartnerToken", token, {
  httpOnly: true,
//   secure: process.env.NODE_ENV === "production", // only send over HTTPS in prod
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
});

        return res.status(200).json({ foodPartner: {
            email,
            restaurantName: foodPartner.restaurantName  ,
            contactName: foodPartner.contactName,
            phone: foodPartner.phone,
            address: foodPartner.address,
            _id: foodPartner._id
        }, message: "Food Partner logged in successfully" });

    } catch (error) {
        console.log(error, "error at login food partner controller");
        return res.status(500).json({ message: error.message, success: false });
    }
}

const logoutFoodPartner = (req, res) => {
    try {
        res.clearCookie("foodPartnerToken");
        return res.status(200).json({ message: "Food Partner logged out successfully" });
    } catch (error) {
        console.log(error, "error at logout food partner controller");
        return res.status(500).json({ message: error.message, success: false });
    }
}


const foodPartnerMe = async (req, res) => {
    try {
        console.log("current")
        const foodPartner = await FoodPartner.findById(req.foodPartner._id).select("-password");
        console.log(req.foodPartner._id, "req.foodPartner._id")
        if (!foodPartner) {
      return res.status(404).json({ message: "Food partner not found" });
    }
        return res.status(200).json({ foodPartner, success: true });
    } catch (error) {
        console.log(error, "error at food partner me controller");
        return res.status(500).json({ message: error.message, success: false });
    }
}

const getFoodPartnerById = async (req, res) => {
    try {
        const foodPartner = await FoodPartner.findById(req.params.foodpartnerid).select("-password");
        if (!foodPartner) {
      return res.status(404).json({ message: "Food partner not found" });
    }
        return res.status(200).json({ foodPartner, success: true });
    } catch (error) {
        console.log(error, "error at food partner by id controller");
        return res.status(500).json({ message: error.message, success: false });
    }
}
module.exports = { register, login, logout, registerFoodPartner, loginFoodPartner, logoutFoodPartner, foodPartnerMe, getFoodPartnerById };
