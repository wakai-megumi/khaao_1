import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Heart, MessageCircle, Bookmark, Home } from "lucide-react";

const SavedFoodPage = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [likes, setLikes] = useState({});
  const [saves, setSaves] = useState({});
  const [counts, setCounts] = useState({});
  const videoRefs = useRef([]);

  // Fetch saved foods
  useEffect(() => {
    const fetchSavedFoods = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/food/saved", {
          withCredentials: true,
        });

        if (response.data.success) {
          const items = response.data.foodInstances || [];
          setSavedItems(items);

          // Initialize state maps
          const initialLikes = {};
          const initialSaves = {};
          const initialCounts = {};

          items.forEach(item => {
            initialLikes[item._id] = item.isLiked || false;
            initialSaves[item._id] = true; // All items here are saved
            initialCounts[item._id] = {
              likes: item.likecount || 0,
              saves: item.savecount || 1,
            };
          });

          setLikes(initialLikes);
          setSaves(initialSaves);
          setCounts(initialCounts);
        }
      } catch (error) {
        console.error("Error fetching saved foods:", error);
      }
    };

    fetchSavedFoods();
  }, []);

  // Autoplay logic for videos
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
  }, [savedItems]);

  // Like food
  const handleLike = async foodId => {
    try {
      const isCurrentlyLiked = likes[foodId];

      // Optimistic update
      setLikes(prev => ({ ...prev, [foodId]: !prev[foodId] }));
      setCounts(prev => ({
        ...prev,
        [foodId]: { ...prev[foodId], likes: prev[foodId].likes + (isCurrentlyLiked ? -1 : 1) },
      }));

      const response = await axios.post(
        "http://localhost:3000/api/food/like",
        { foodId },
        { withCredentials: true }
      );

      if (!response.data.success) {
        setLikes(prev => ({ ...prev, [foodId]: isCurrentlyLiked }));
        setCounts(prev => ({
          ...prev,
          [foodId]: { ...prev[foodId], likes: prev[foodId].likes + (isCurrentlyLiked ? 1 : -1) },
        }));
      }
    } catch (error) {
      console.error("Error liking saved food:", error);
    }
  };

  // Unsave food (removes from saved list)
  const handleSaveToggle = async foodId => {
    try {
      const isCurrentlySaved = saves[foodId];

      // Optimistic update
      setSaves(prev => ({ ...prev, [foodId]: !prev[foodId] }));
      setCounts(prev => ({
        ...prev,
        [foodId]: { ...prev[foodId], saves: prev[foodId].saves + (isCurrentlySaved ? -1 : 1) },
      }));

      const response = await axios.post(
        "http://localhost:3000/api/food/save",
        { foodId },
        { withCredentials: true }
      );

      if (!response.data.success) {
        // Revert if API fails
        setSaves(prev => ({ ...prev, [foodId]: isCurrentlySaved }));
        setCounts(prev => ({
          ...prev,
          [foodId]: { ...prev[foodId], saves: prev[foodId].saves + (isCurrentlySaved ? 1 : -1) },
        }));
      } else if (!isCurrentlySaved) {
        // Remove from list visually after unsaving
        setSavedItems(prev => prev.filter(item => item._id !== foodId));
      }
    } catch (error) {
      console.error("Error unsaving food:", error);
    }
  };

  if (!savedItems.length) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-gray-400">
        <p className="text-lg font-medium">No saved food items found.</p>
        <Link
          to="/"
          className="mt-4 text-blue-400 underline hover:text-blue-300 transition"
        >
          Go back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory relative">
      {savedItems.map((item, index) => (
        <div
          key={item._id}
          className="relative h-screen w-full snap-start flex items-center justify-center"
        >
          {/* === Video or Image === */}
          {item.media?.endsWith(".mp4") ? (
            <video
              ref={el => (videoRefs.current[index] = el)}
              src={item.media}
              className="h-full w-full object-cover"
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={item.media}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          )}

          {/* === Right Floating Action Buttons === */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-20">
            {/* Like */}
            <button onClick={() => handleLike(item._id)} className="focus:outline-none">
              <Heart
                size={30}
                className={likes[item._id] ? "text-red-500 fill-red-500" : "text-white"}
              />
            </button>
            <span className="text-white text-xs">{counts[item._id]?.likes || 0}</span>

            {/* Comment */}
            <button className="focus:outline-none">
              <MessageCircle size={30} className="text-white" />
            </button>
            <span className="text-white text-xs">0</span>

            {/* Save */}
            <button onClick={() => handleSaveToggle(item._id)} className="focus:outline-none">
              <Bookmark
                size={30}
                className={
                  saves[item._id] ? "text-yellow-400 fill-yellow-400" : "text-white"
                }
              />
            </button>
            <span className="text-white text-xs">{counts[item._id]?.saves || 0}</span>
          </div>

          {/* === Bottom Transparent Info === */}
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

      {/* === Bottom Fixed Navigation === */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm flex justify-around items-center py-2 z-20">
        <Link
          to="/"
          className="text-white opacity-90 hover:opacity-100 transition-transform hover:scale-110 flex flex-col items-center"
        >
          <Home size={32} />
          <span className="text-xs text-white">Home</span>
        </Link>
        <Link
          to="/saved"
          className="text-yellow-400 transition-transform hover:scale-110 flex flex-col items-center"
        >
          <Bookmark size={32} className="fill-yellow-400" />
          <span className="text-xs text-yellow-400">Saved</span>
        </Link>
      </div>
    </div>
  );
};

export default SavedFoodPage;
