import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { SparklesIcon, UserIcon, SearchIcon, CoffeeIcon, LeafIcon, ActivityIcon, StarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';

const Hangouts = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [places, setPlaces] = useState([]);
  const [topRatedPlaces, setTopRatedPlaces] = useState([]);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || false
  );
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const url = "http://127.0.0.1:5000";
  // Fetch top-rated places from the backend
  useEffect(() => {
    const fetchTopRatedPlaces = async () => {
      try {
        const response = await axios.get(`${url}/top-rated-places`);
        if (response.data.success) {
          console.log("success");
          setTopRatedPlaces(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching top-rated places:', error);
      }
    };

    fetchTopRatedPlaces();
  }, []);

  // Fetch places based on search input
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.get('/search', {
          params: { query: search },
        });
        if (response.data.success) {
          setPlaces(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching places:', error);
      }
    };

    if (search) {
      fetchPlaces();
    } else {
      setPlaces([]); // Reset places when search is cleared
    }
  }, [search]);

  const handleCardClick = (category) => {
    navigate(`/socials/hangouts/${category}`);
  };
  const handleBack = () => {
    setSelectedCategory(null); // Reset category selection
  };
  // Handle dark mode toggle
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Slider settings
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'} overflow-x-hidden`}
    >
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 flex items-center justify-between px-4 w-full">
        <button
          onClick={() => window.history.back()}
          className="px-3 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
        >
          Back
        </button>
        <div className="flex-1 flex justify-center">
          <h1 className="text-2xl font-bold">&nbsp;&nbsp;&nbsp;Hangouts Near You</h1>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={() => navigate('/profile')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <UserIcon className="text-gray-800 dark:text-gray-200" />
          </motion.button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 grid grid-cols-3 gap-6">
        {/* Left Section: Main Category Cards */}
        <div className="col-span-1">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Explore Hangouts
          </motion.h2>
          {['foodies', 'nature', 'activities'].map((category) => (
            <motion.div
              key={category}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              className={`bg-gradient-to-br ${
                category === 'foodies' ? 'from-orange-500 to-yellow-600' : category === 'nature' ? 'from-green-500 to-teal-600' : 'from-purple-500 to-indigo-600'
              } text-white rounded-xl p-6 shadow-lg transform transition-all duration-200 hover:shadow-xl cursor-pointer mb-6`}
              onClick={() => handleCardClick(category)}
            >
              <div className="flex justify-center items-center mb-4">
                {category === 'foodies' && <CoffeeIcon className="text-white text-4xl" />}
                {category === 'nature' && <LeafIcon className="text-white text-4xl" />}
                {category === 'activities' && <ActivityIcon className="text-white text-4xl" />}
              </div>
              <h3 className="text-xl font-bold mb-2">{category === 'foodies' ? 'Foodies' : category === 'nature' ? 'Nature Lovers' : 'Fun Activities'}</h3>
              <p className="text-sm text-center">Discover places and activities for {category === 'foodies' ? 'food lovers' : category === 'nature' ? 'nature enthusiasts' : 'fun seekers'}</p>
            </motion.div>
          ))}
        </div>

        {/* Middle Section: Carousel & Search Bar */}
        <div className="col-span-2 ml-20">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Top Rated Hangouts
          </motion.h2>

          {/* Carousel */}
          <Slider {...settings}>
            {topRatedPlaces.map((place) => (
              <motion.div
                key={place.name}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg"
              >
                <img src={`data:image/jpeg;base64,${place.image}`} alt={place.name} className="w-full h-32 object-cover rounded-lg mb-4" />
                <h4 className="text-lg font-semibold">{place.name}</h4>
                <div className="flex items-center space-x-2 mt-2">
                  <StarIcon className="text-yellow-500" size={16} />
                  <span>{place.avg_rating}</span>
                </div>
              </motion.div>
            ))}
            
          </Slider>

          {/* Search Input */}
          <div className="relative mb-8 max-w-lg mx-auto mt-8">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a place..."
              className="w-full p-3 pl-10 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SearchIcon size={24} className="absolute top-3 left-3 text-gray-500" />
          </div>

          {/* Filtered Places */}
          <div className="grid grid-cols-1 gap-6">
            {places.map((place) => (
              <motion.div
                key={place.name}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg"
              >
                <img src={`data:image/jpeg;base64,${place.image}`} alt={place.name} className="w-full h-32 object-cover rounded-lg mb-4" />
                <h4 className="text-lg font-semibold">{place.name}</h4>
                <div className="flex items-center space-x-2 mt-2">
                  <StarIcon className="text-yellow-500" size={16} />
                  <span>{place.avg_rating}</span>
                </div>
              </motion.div>
              
            ))}
            {/* Add Review Button */}
         <motion.button
          onClick={() => navigate('/socials/hangouts/add')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 px-8 py-3 bg-blue-500 text-white text-lg rounded-full hover:bg-blue-600 transition"
          >
            <SparklesIcon className="inline-block mr-3 text-yellow-300" size={20} />
            Add Your Review

          </motion.button>
          </div>
        </div>
         
      </main>
    </div>
  );
};

export default Hangouts;
