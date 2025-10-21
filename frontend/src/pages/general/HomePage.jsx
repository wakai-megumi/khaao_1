import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Heart, MessageCircle, Bookmark, Home } from "lucide-react";

const HomePage = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [likes, setLikes] = useState({});
  const [saves, setSaves] = useState({});
  const [counts, setCounts] = useState({}); // { [foodId]: { likes: 0, saves: 0 } }
  const videoRefs = useRef([]);

  // Fetch food items and initialize state
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/food/getAll");
        if (response.data.success) {
          setFoodItems(response.data.fooditems);

          const initialLikes = {};
          const initialSaves = {};
          const initialCounts = {};

          response.data.fooditems.forEach(item => {
            initialLikes[item._id] = item.isLiked || false;
            initialSaves[item._id] = item.isSaved || false;
            initialCounts[item._id] = {
              likes: item.likecount || 0,
              saves: item.savecount || 0,
            };
          });

          setLikes(initialLikes);
          setSaves(initialSaves);
          setCounts(initialCounts);
        }
      } catch (err) {
        console.error("Error fetching food items:", err);
      }
    };
    fetchFoodItems();
  }, []);

  // IntersectionObserver for autoplay
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target;
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        });
      },
      { root: null, threshold: 0.8 }
    );

    videoRefs.current.forEach(video => video && observer.observe(video));
    return () =>
      videoRefs.current.forEach(video => video && observer.unobserve(video));
  }, [foodItems]);

  // Like functionality
  const handleLike = async foodId => {
    try {
      const isCurrentlyLiked = likes[foodId];

      // Optimistic update
      setLikes(prev => ({ ...prev, [foodId]: !prev[foodId] }));
      setCounts(prev => ({
        ...prev,
        [foodId]: { ...prev[foodId], likes: prev[foodId].likes + (isCurrentlyLiked ? -1 : 1) }
      }));

      const response = await axios.post(
        "http://localhost:3000/api/food/like",
        { foodId },
        { withCredentials: true }
      );

      if (!response.data.success) {
        // Revert if API fails
        setLikes(prev => ({ ...prev, [foodId]: isCurrentlyLiked }));
        setCounts(prev => ({
          ...prev,
          [foodId]: { ...prev[foodId], likes: prev[foodId].likes + (isCurrentlyLiked ? 1 : -1) }
        }));
      }
    } catch (err) {
      console.error(err);
      const isCurrentlyLiked = likes[foodId];
      setLikes(prev => ({ ...prev, [foodId]: isCurrentlyLiked }));
      setCounts(prev => ({
        ...prev,
        [foodId]: { ...prev[foodId], likes: prev[foodId].likes + (isCurrentlyLiked ? 1 : -1) }
      }));
    }
  };

  // Save functionality
  const handleSave = async foodId => {
    try {
      const isCurrentlySaved = saves[foodId];

      // Optimistic update
      setSaves(prev => ({ ...prev, [foodId]: !prev[foodId] }));
      setCounts(prev => ({
        ...prev,
        [foodId]: { ...prev[foodId], saves: prev[foodId].saves + (isCurrentlySaved ? -1 : 1) }
      }));

      const response = await axios.post(
        "http://localhost:3000/api/food/save",
        { foodId },
        { withCredentials: true }
      );

      if (!response.data.success) {
        setSaves(prev => ({ ...prev, [foodId]: isCurrentlySaved }));
        setCounts(prev => ({
          ...prev,
          [foodId]: { ...prev[foodId], saves: prev[foodId].saves + (isCurrentlySaved ? 1 : -1) }
        }));
      }
    } catch (err) {
      console.error(err);
      const isCurrentlySaved = saves[foodId];
      setSaves(prev => ({ ...prev, [foodId]: isCurrentlySaved }));
      setCounts(prev => ({
        ...prev,
        [foodId]: { ...prev[foodId], saves: prev[foodId].saves + (isCurrentlySaved ? 1 : -1) }
      }));
    }
  };

  if (!foodItems.length) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading food items...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory relative">
      {foodItems.map((item, index) => (
        <div
          key={item._id}
          className="relative h-screen w-full snap-start flex items-center justify-center"
        >
          {/* Video */}
          <video
            ref={el => (videoRefs.current[index] = el)}
            src={item.media}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
          />

          {/* Right Floating Action Buttons */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-20">
            <button onClick={() => handleLike(item._id)} className="focus:outline-none">
              <Heart
                size={30}
                className={likes[item._id] ? "text-red-500 fill-red-500" : "text-white"}
              />
            </button>
            <span className="text-white text-xs">{counts[item._id]?.likes || 0}</span>

            <button className="focus:outline-none">
              <MessageCircle size={30} className="text-white" />
            </button>
            <span className="text-white text-xs">0</span>

            <button onClick={() => handleSave(item._id)} className="focus:outline-none">
              <Bookmark
                size={30}
                className={saves[item._id] ? "text-yellow-400 fill-yellow-400" : "text-white"}
              />
            </button>
            <span className="text-white text-xs">{counts[item._id]?.saves || 0}</span>
          </div>

          {/* Bottom Transparent Info */}
          <div className="absolute bottom-20 left-5 right-5 p-2 z-10">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1">{item.name}</h2>
            <p className="text-white text-sm line-clamp-3">{item.description}</p>
            <div className="mt-3 flex justify-start items-center gap-4">
              <Link
                to={`/foodpartner/${item._id}`}
                className="py-1 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm transition"
              >
                Visit Store
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Bottom Fixed Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm flex justify-around items-center py-2 z-20">
        <Link
          to="/"
          className="text-white opacity-90 hover:opacity-100 transition-transform hover:scale-110 flex flex-col items-center"
        >
          <Home size={32} />
          <span className="text-white text-xs">Home</span>
        </Link>
        <Link
          to="/saved"
          className="text-white opacity-90 hover:opacity-100 transition-transform hover:scale-110 flex flex-col items-center"
        >
          <Bookmark size={32} />
          <span className="text-white text-xs">Saved</span>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
