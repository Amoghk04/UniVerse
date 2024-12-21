import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, UserIcon, SearchIcon, CoffeeIcon, LeafIcon, ActivityIcon, StarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

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

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayCount, setDisplayCount] = useState(3);

  // Update display count based on window width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setDisplayCount(1);
      } else if (window.innerWidth < 1024) {
        setDisplayCount(2);
      } else {
        setDisplayCount(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carousel navigation functions
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + displayCount >= topRatedPlaces.length ? 0 : prevIndex + displayCount
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - displayCount < 0 ? Math.max(0, topRatedPlaces.length - displayCount) : prevIndex - displayCount
    );
  };

  // Get visible places for carousel
  const visiblePlaces = topRatedPlaces.slice(currentIndex, currentIndex + displayCount);

  // Rest of your existing effects...
  useEffect(() => {
    const fetchTopRatedPlaces = async () => {
      try {
        const response = await axios.get(`${url}/top-rated-places`);
        if (response.data.success) {
          setTopRatedPlaces(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching top-rated places:', error);
      }
    };

    fetchTopRatedPlaces();
  }, []);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.get(`${url}/search`, {
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
      setPlaces([]);
    }
  }, [search]);

  const handleCardClick = (category) => {
    navigate(`/socials/hangouts/${category}`);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'} overflow-x-hidden`}>
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
  
      <main className="container mx-auto px-4 py-12 flex flex-col gap-6">
        {/* Top Rated Section with Carousel */}
        <div className="w-full">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Top Rated Hangouts
          </motion.h2>
  
          <div className="relative w-full px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSlide}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSlide}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </div>
  
            <div className="relative overflow-hidden">
              <motion.div 
                className="flex gap-4"
                initial={false}
              >
                <AnimatePresence mode="wait">
                  {visiblePlaces.map((place, index) => (
                    <motion.div
                      key={`${place.name}-${index}`}
                      className={`flex-1 min-w-0 ${displayCount === 1 ? 'w-full' : displayCount === 2 ? 'w-1/2' : 'w-1/3'}`}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full">
                        <div className="relative h-48 sm:h-64 md:h-72 lg:h-80">
                          <img
                            src={`data:image/jpeg;base64,${place.image}`}
                            alt={place.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <h3 className="text-white text-xl font-bold truncate">
                              {place.name}
                            </h3>
                            <div className="flex items-center space-x-2 mt-2">
                              <StarIcon className="text-yellow-400 w-5 h-5" />
                              <span className="text-white">{place.avg_rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
  
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: Math.ceil(places.length / displayCount) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx * displayCount)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    Math.floor(currentIndex / displayCount) === idx 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
  
        {/* Category Cards Section */}
        <div className="w-full">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Explore Hangouts
          </motion.h2>
  
          <div className="flex flex-wrap justify-center gap-6">
            {['foodies', 'nature', 'activities'].map((category) => (
              <motion.div
                key={category}
                initial={{ opacity: 0.5, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                className={`bg-gradient-to-br ${
                  category === 'foodies'
                    ? 'from-orange-500 to-yellow-600'
                    : category === 'nature'
                    ? 'from-green-500 to-teal-600'
                    : 'from-purple-500 to-indigo-600'
                } text-white rounded-xl p-6 shadow-lg transform transition-all duration-200 hover:shadow-xl cursor-pointer mb-6 w-full sm:w-80 md:w-96 mx-auto relative overflow-hidden`}
                onClick={() => handleCardClick(category)}
              >
                <div className="flex justify-center items-center mb-4">
                  {category === 'foodies' && <CoffeeIcon className="text-white text-5xl" />}
                  {category === 'nature' && <LeafIcon className="text-white text-5xl" />}
                  {category === 'activities' && <ActivityIcon className="text-white text-5xl" />}
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">
                  {category === 'foodies'
                    ? 'Foodies'
                    : category === 'nature'
                    ? 'Nature Lovers'
                    : 'Fun Activities'}
                </h3>
                <p className="text-sm text-center">
                  Discover places and activities for{' '}
                  {category === 'foodies'
                    ? 'food lovers'
                    : category === 'nature'
                    ? 'nature enthusiasts'
                    : 'fun seekers'}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
  
        {/* Search Section */}
        <div className="w-full">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Search for Hangouts
          </motion.h2>
  
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
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {search.length > 0 && places.length > 0 ? (
              places.map((place) => (
                <motion.div
                  key={place.name}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src={`data:image/jpeg;base64,${place.image}`}
                    alt={place.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{place.name}</h4>
                  <div className="flex items-center space-x-2 mt-2">
                    <StarIcon className="text-yellow-500" size={20} />
                    <span className="text-gray-700 dark:text-gray-300">{place.avg_rating}</span>
                  </div>
                </motion.div>
              ))
            ) : search.length > 0 && places.length === 0 ? (
              <p className="mx-auto">No places found for your search.</p>
            ) : (
              <p className="mx-auto">Start typing to search for places...</p>
            )}
          </div>
  
          <motion.button
            onClick={() => navigate('/socials/hangouts/add')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mx-auto mt-8 px-8 py-3 bg-blue-500 text-white text-lg rounded-full hover:bg-blue-600 transition flex items-center justify-center"
          >
            <SparklesIcon className="inline-block mr-3 text-yellow-300" size={20} />
            Add Your Review
          </motion.button>
        </div>
      </main>
    </div>
  );
};

export default Hangouts;
