const foodModel = require("../models/food.model.js");
const imagekit = require("../services/storage.service.js");
const {v4: uuid} = require("uuid");
const likesModel = require("../models/likes.models.js");
const userModel = require("../models/user.model.js");
const savedFoodModel = require("../models/savedFood.model.js");
const mongoose = require("mongoose");
const fs = require("fs");


const createFood = async (req, res) => {
  try {
    const foodpartnerId = req.foodPartner?._id;

    if (!foodpartnerId) {
      return res.status(400).json({ message: "Food partner ID missing", success: false });
    }

    const { name, description, price, category } = req.body;
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Media file is required", success: false });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "video/mp4", "video/mov"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images and videos allowed.", success: false });
    }

    const filePath = req.file.path;

    const imagekitResponse = await imagekit.files.upload({
      file: fs.createReadStream(filePath),
      fileName: uuid(),
      folder: "/food_items",
    });


    const media = imagekitResponse.url;

    // ✅ Ensure ObjectId creation is valid
    const partnerObjectId = new mongoose.Types.ObjectId(foodpartnerId);

    const foodinstance = await foodModel.create({
      name,
      description,
      price,
      media,
      category,
      fileType: imagekitResponse.fileType,
      foodPartner: partnerObjectId,
    });

    return res.status(201).json({ foodinstance, success: true });
  } catch (error) {
    console.log(error, "error at create food controller");
    return res.status(500).json({ message: error.message, success: false });
  }
};


const getAllFood = async (req, res) => {
    try {
        const fooditems = await foodModel.find()
        return res.status(200).json({ fooditems, success: true });
    } catch (error) {
        console.log(error, "error at get all food controller");
        return res.status(500).json({ message: error.message, success: false });
    }
}

const getFoodByPartner = async (req, res) => {
  try {
    const partnerId = req.params.id;
    if (!partnerId) {
      return res.status(400).json({ message: "Partner ID is required", success: false });
    }
     const fooditems = await foodModel.find({
      foodPartner: new mongoose.Types.ObjectId(partnerId),
    });
    return res.status(200).json({ fooditems, success: true });
  } catch (error) {
    console.log(error, "error at get food by partner controller");
    return res.status(500).json({ message: error.message, success: false });
  }
};

const likeFood = async (req, res) => {
  try {
    const { foodId } = req.body;
    const userId = req.user._id;
    if (!foodId || !userId) {
      return res.status(400).json({ message: "All details are required", success: false });
    }
    const foodInstance = await foodModel.findById(foodId);
    if (!foodInstance) {
      return res.status(404).json({ message: "Food not found", success: false });
    }
   
    const userInstance = await userModel.findById(userId);
    if (!userInstance) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    // foodId = mongoose.Types.ObjectId(foodId);
    const foodObjectId = new mongoose.Types.ObjectId(foodId);
    const userIdObject = new mongoose.Types.ObjectId(userId);
     const isLiked = await likesModel.findOne({ foodId: foodObjectId, userId: userIdObject });
    if (isLiked) {
      await likesModel.deleteOne({ foodId: foodObjectId, userId: userIdObject });
      await foodModel.updateOne({ _id: foodObjectId }, { $inc: { likecount: -1 } });
      return res.status(200).json({ message: "Unliked successfully", success: true });
    }
    const likeInstance = await likesModel.create({ foodId: foodObjectId, userId: userIdObject });
    await foodModel.updateOne({ _id: foodObjectId }, { $inc: { likecount: 1 } });
    return res.status(200).json({ likeInstance, success: true });
  } catch (error) {
    console.log(error, "error at like food controller");
    return res.status(500).json({ message: error.message, success: false });
  }
};

const saveFood = async (req, res) => {
    try {
        const { foodId } = req.body;
        const userId = req.user._id;
        if (!foodId || !userId) {
            return res.status(400).json({ message: "All details are required", success: false });
        }
        const foodInstance = await foodModel.findById(foodId);
        if (!foodInstance) {
            return res.status(404).json({ message: "Food not found", success: false });
        }
        const userInstance = await userModel.findById(userId);
        if (!userInstance) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        const foodObjectId = new mongoose.Types.ObjectId(foodId);
        const userIdObject = new mongoose.Types.ObjectId(userId);
        const isSaved = await savedFoodModel.findOne({ foodId: foodObjectId, userId: userIdObject });
        if (isSaved) {
            await savedFoodModel.deleteOne({ foodId: foodObjectId, userId: userIdObject });
            return res.status(200).json({ message: "Unsaved successfully", success: true });
        }
        const savedFoodInstance = await savedFoodModel.create({ foodId: foodObjectId, userId: userIdObject });
        return res.status(200).json({ savedFoodInstance, success: true });
    } catch (error) {
        console.log(error, "error at save food controller");
        return res.status(500).json({ message: error.message, success: false });
    }
};

const savedFood = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required", success: false });
        }
        const userInstance = await userModel.findById(userId);
        if (!userInstance) {

            return res.status(404).json({ message: "User not found", success: false });
        }
        const userIdObject = new mongoose.Types.ObjectId(userId);
        const savedFoodInstances = await savedFoodModel.find({ userId: userIdObject }).populate("foodId");
        const foodIds = savedFoodInstances.map(savedFood => savedFood.foodId._id);
        const foodInstances = await foodModel.find({ _id: { $in: foodIds } });
        return res.status(200).json({ foodInstances, success: true });
    } catch (error) {
        console.log(error, "error at saved food controller");
        return res.status(500).json({ message: error.message, success: false });
    }
};


module.exports = { createFood, getAllFood, getFoodByPartner, likeFood , saveFood, savedFood };