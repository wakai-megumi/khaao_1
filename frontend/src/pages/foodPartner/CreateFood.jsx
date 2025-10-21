import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
const CreateFood = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    media: null,
  });
  const [partnerInfo, setPartnerInfo] = useState(null); 
  const [preview, setPreview] = useState("");
  const [mediaType, setMediaType] = useState(""); // detect image/video
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

   useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/auth/foodPartner/me",
          { withCredentials: true } // ✅ JWT cookie check
        );

        console.log("✅ Authenticated Food Partner:", response.data);
    
        setPartnerInfo(response.data.foodPartner);
        console.log(partnerInfo)
      
      } catch (err) {
        console.error("❌ No food partner logged in:", err);
        setError("You must be logged in as a Food Partner to create items.");

        // 🔁 Redirect to login after short delay
        setTimeout(() => {
          navigate("/foodpartner/login");
        }, 1000);
      }
    };

    fetchPartnerData();
  }, [navigate]);

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle media upload (image or video)
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setError("Invalid file type. Please upload image or video only.");
      return;
    }

    setMediaType(isImage ? "image" : "video");
    setError("");

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    setFormData((prev) => ({
      ...prev,
      media: file,
    }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.category ||
      !formData.media
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setIsLoading(true);

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        formDataToSend.append(key, value)
      );

      const response = await axios.post(
        "http://localhost:3000/api/food/",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        alert("✅ Food item created successfully!");
        navigate(`/foodpartner/${partnerInfo._id}`);
      }
    } catch (err) {
      console.error("Error creating food item:", err);
      setError(err.response?.data?.message || "Failed to create food item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Welcome, {partnerInfo?.restaurantName}
          </h2>
          <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Add New Food Item
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Media Upload (Image or Video) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Image or Video
              </label>
              <div className="flex justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6">
                {preview ? (
                  mediaType === "image" ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-40 w-40 object-cover rounded-md"
                    />
                  ) : (
                    <video
                      src={preview}
                      controls
                      className="h-40 w-40 rounded-md object-cover"
                    />
                  )
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <span className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                      Upload image or video
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleMediaChange}
                      accept="image/*,video/*"
                      required
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      JPG, PNG, or MP4 up to 20MB
                    </p>
                  </label>
                )}
              </div>
            </div>

            {/* Food Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Food Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Margherita Pizza"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe the food item..."
                required
              />
            </div>

            {/* Price and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="appetizer">Appetizer</option>
                  <option value="main">Main Course</option>
                  <option value="dessert">Dessert</option>
                  <option value="beverage">Beverage</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Food Item"}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 px-8 py-4 border-t border-gray-200 dark:border-gray-600 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Want to manage your menu?{" "}
            <button
              onClick={() => navigate(`/foodpartner/${partnerInfo._id}`)}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Go to Profile
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateFood;
