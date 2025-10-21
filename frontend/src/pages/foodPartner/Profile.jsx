import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch partner info
  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/auth/foodPartner/me",
          { withCredentials: true }
        );
        setPartnerInfo(response.data.foodPartner);
      } catch (err) {
        console.error(err);
        setError("You must be logged in as a Food Partner.");
        setTimeout(() => navigate("/foodpartner/login"), 1000);
      }
    };
    fetchPartnerData();
  }, [navigate]);

  // Fetch food items
  useEffect(() => {
    if (!partnerInfo?._id) return;
    const fetchFoodItems = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/food/byPartner/${partnerInfo._id}`,
          { withCredentials: true }
        );
        setFoodItems(response.data.fooditems || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load food items.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFoodItems();
  }, [partnerInfo?._id]);

  if (error)
    return <div className="text-center mt-20 text-red-500">{error}</div>;

  if (isLoading)
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-6xl mx-auto mt-10">
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className="bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse h-40"
          />
        ))}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-7 px-2">
      {/* Partner Info */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-row items-center gap-4 mb-6">
        <img
          src={partnerInfo?.profilePicture || "/default-profile.png"}
          alt="Profile"
          className="h-24 w-24 rounded-full object-cover border-2 border-blue-600"
        />
        <div className="text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {partnerInfo?.restaurantName || "Restaurant Name"}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Contact: {partnerInfo?.contactName || "N/A"}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {partnerInfo?.address || "Address"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-2 mb-8 flex flex-row justify-between text-center">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{foodItems.length}</p>
          <p className="text-gray-500 dark:text-gray-400">Total Items</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">123</p>
          <p className="text-gray-500 dark:text-gray-400">Total Orders</p>
        </div>
      </div>

      {/* Food Items */}
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 max-w-6xl mx-auto flex justify-between items-center">
  <span>Food Items</span>
  <button
    onClick={() => navigate("/create_food")}
    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition"
  >
    + Add Food
  </button>
</h3>


      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {foodItems.map((food) => (
          <div
            key={food._id}
            className="rounded-md overflow-hidden shadow-md relative group bg-white dark:bg-gray-800"
          >
            {food.fileType === "non-image" ? (

              <video
                src={food.media}
                muted
                loop
                playsInline
                preload="metadata"
                className="h-40 w-full object-cover rounded-md"
                onMouseEnter={(e) => e.target.play()}
                onMouseLeave={(e) => e.target.pause()}
              />
            ) : (
              <img
                src={food.media}
                alt={food.name}
                className="h-40 w-full object-cover rounded-md"
              />
            )}
            <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-40 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <h4 className="font-semibold">{food.name}</h4>
              <p className="text-sm">₹{food.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
