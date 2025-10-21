const express = require("express");
const { register, login, logout, registerFoodPartner, loginFoodPartner, logoutFoodPartner, foodPartnerMe, getFoodPartnerById } = require("../controllers/auth.controller");
const { authFoodPartner } = require("../middleware/auth.middleware.js");
const router = express.Router();



router.post("/user/register", register);
router.post("/user/login", login);
router.get("/user/logout", logout);

// food partner auth API's
router.post("/foodPartner/register", registerFoodPartner);
router.post("/foodPartner/login", loginFoodPartner);
router.get("/foodPartner/logout", logoutFoodPartner);
router.get("/foodPartner/me", authFoodPartner, foodPartnerMe);
router.get("/foodPartner/:foodpartnerid", authFoodPartner, getFoodPartnerById);

module.exports = router;
