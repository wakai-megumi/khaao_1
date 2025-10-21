const express = require("express");
const { createFood, getAllFood, getFoodByPartner, likeFood, saveFood, savedFood } = require("../controllers/food.controller.js");
const foodRouter = express.Router();

const { authFoodPartner, authUserMiddleware } = require("../middleware/auth.middleware.js");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

// Create upload folder if it doesn't exist
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Cleanup helper
const cleanupFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
      else console.log("Temporary file deleted:", filePath);
    });
  }
};

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "video/mp4", "video/mov"];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type. Only images and videos allowed."));
  },
});

// Route: create food with safe cleanup
foodRouter.post("/", authFoodPartner, upload.single("media"), createFood);

foodRouter.get("/getAll", getAllFood);
foodRouter.get("/bypartner/:id", authUserMiddleware, getFoodByPartner);
foodRouter.post("/like", authUserMiddleware, likeFood);
foodRouter.post("/save", authUserMiddleware, saveFood);
foodRouter.get("/savedfood", authUserMiddleware, savedFood);
module.exports = foodRouter;
