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
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark" || false);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [placesCategorized, setPlacesCategorized] = useState([]); // Separate state for categorized filtering
  const [query, setQuery] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [sortOrder, setSortOrder] = useState('none'); // for sorting order
  const navigate = useNavigate();
  const url = "http://20.197.34.29:5000";

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

  // Fetch places from the backend
  const fetchPlaces = async () => {
    try {
      const response = await axios.get(`${url}/fetchallplaces`);
      if (response.data.success) {
        setPlaces(response.data.data);
        setFilteredPlaces(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const handleCategoryClick = (category) => {
    console.log('Category clicked:', category); // Check the category passed in
    const categorizedPlaces = places.filter(place => {
      console.log('Place Category:', place.category); // Log place category
      return place.category === category;
    });
    console.log('Filtered places based on category:', categorizedPlaces);
    setFilteredPlaces(categorizedPlaces);
  };
  
  // Handle sorting
  const handleSortChange = (order) => {
    setSortOrder(order);
    if (order === 'asc') {
      setFilteredPlaces([...filteredPlaces].sort((a, b) => a.avg_rating - b.avg_rating));
    } else if (order === 'desc') {
      setFilteredPlaces([...filteredPlaces].sort((a, b) => b.avg_rating - a.avg_rating));
    } else {
      setFilteredPlaces(places); // reset to original places
    }
  };

  // Search filter
  useEffect(() => {
    if (query.trim() === '') {
      setFilteredPlaces(places);
    } else {
      setFilteredPlaces(places.filter(place => place.name.toLowerCase().includes(query.toLowerCase())));
    }
  }, [query, places]);

  // Fetch reviews for a selected place
  const fetchReviews = async (placeName) => {
    try {
      const response = await axios.get(`http://20.197.34.29:5000/reviews/${placeName}`);
      setReviews(response.data);
      setSelectedPlace(placeName);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlace(null);
    setReviews([]);
  };

  // Fetch places on initial render
  useEffect(() => {
    fetchPlaces();
  }, []);

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'} overflow-x-hidden`}>
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 flex items-center justify-between px-4 w-full">
        
        <div className="flex-1 flex justify-center">
          <h1 className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">Hangouts</h1>
        </div>
        <div className="flex items-center space-x-4">
         
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

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-center mt-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
        >
          Explore Hangouts
        </motion.h2>

        <div className="flex justify-center gap-6 flex-wrap"> 
  {['foodies', 'nature', 'activities'].map((category) => (
    <motion.div
      key={category}
      initial={{ opacity: 0.5, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      className={`bg-gradient-to-br ${category === 'foodies' ? 'from-orange-500 to-yellow-600' :
        category === 'nature' ? 'from-green-500 to-teal-600' : 'from-purple-500 to-indigo-600'}
        text-white rounded-xl p-6 shadow-lg transform transition-all duration-200 hover:shadow-xl cursor-pointer mb-6 max-w-xs mx-auto relative overflow-hidden animate-wind`}  // Added wind animation class
    >
      <div className="flex justify-center items-center mb-4">
        {category === 'foodies' && <CoffeeIcon className="text-white text-5xl" />}
        {category === 'nature' && <LeafIcon className="text-white text-5xl" />}
        {category === 'activities' && <ActivityIcon className="text-white text-5xl" />}
      </div>
      <h3 className="text-xl font-bold mb-2 text-center">
        {category === 'foodies' ? 'Foodies' : category === 'nature' ? 'Nature Lovers' : 'Fun Activities'}
      </h3>
      <p className="text-sm text-center">
        Discover places and activities for{' '}
        {category === 'foodies' ? 'food lovers' :
          category === 'nature' ? 'nature enthusiasts' : 'fun seekers'}
      </p>
    </motion.div>
  ))}
</div>


        {/* Search Bar, Filter, and Sort Options Below the Carousel */}
        <div className="w-full flex items-center justify-between my-6">
          {/* Search Input */}
          <motion.input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a place..."
            className="w-full p-3 pl-10 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-lg"
          />
          

          {/* Category Icons */}
          <div className="flex space-x-4 ml-4">
            <motion.div onClick={() => handleCategoryClick('food')} className="cursor-pointer p-2 rounded-full hover:bg-gray-200">
              <CoffeeIcon size={24} />
            </motion.div>
            <motion.div onClick={() => handleCategoryClick('nature')} className="cursor-pointer p-2 rounded-full hover:bg-gray-200">
              <LeafIcon size={24} />
            </motion.div>
            <motion.div onClick={() => handleCategoryClick('activities')} className="cursor-pointer p-2 rounded-full hover:bg-gray-200">
              <ActivityIcon size={24} />
            </motion.div>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortOrder}
            onChange={(e) => handleSortChange(e.target.value)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">Sort by Rating</option>
            <option value="asc">Lowest to Highest</option>
            <option value="desc">Highest to Lowest</option>
          </select>
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {(selectedCategory ? placesCategorized : filteredPlaces).length > 0 ? (
            (selectedCategory ? placesCategorized : filteredPlaces).map((place) => (
              <div key={place._id} onClick={() => fetchReviews(place.name)} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer">
                <img src={`data:image/jpeg;base64,${place.image}`} alt={place.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h2 className="text-xl font-bold">{place.name}</h2>
                  <p className="text-sm text-gray-400 flex items-center">⭐ Rating: {place.avg_rating}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No Places Found.</p>
          )}
        </div>

        {/* Modal for Reviews */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white text-black rounded-lg p-6 w-3/4 max-w-lg">
              <h2 className="text-2xl font-bold mb-4">{selectedPlace}</h2>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace)}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline mb-4 block">
                Get Directions to {selectedPlace}
              </a>
              <h2 className="text-2xl font-bold mb-4">Reviews</h2>
              <button onClick={closeModal} className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded">Close</button>
              <div className="mb-6">
                <img src={`data:image/jpeg;base64,${places.find(r => r.name === selectedPlace)?.image}`} alt={selectedPlace} className="w-full object-contain rounded-lg" />
              </div>
              {reviews.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  <ul className="space-y-4">
                    {reviews.map((review) => (
                      <li key={review._id} className="border-b pb-2 last:border-b-0">
                        <p className="font-semibold">Rating: {review.rating}/5</p>
                        <p className="italic">{review.review}</p>
                        <p className="text-gray-500 text-sm">By: {review.username || 'Anonymous'}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No reviews available for this place.</p>
              )}
            </div>
          </div>
        )}

<motion.button onClick={() => navigate('/socials/hangouts/add')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mx-auto mt-8 px-8 py-3 bg-blue-500 text-white text-lg rounded-full hover:bg-blue-600 transition">
          <SparklesIcon className="inline-block mr-3 text-yellow-300" size={20} />
          Add Your Review
        </motion.button>
      </main>
    </div>
  );
};

export default Hangouts;
