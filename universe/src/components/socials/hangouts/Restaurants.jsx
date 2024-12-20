import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon, UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



const Restaurants = () => {
  const [foods, setFoods] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const fetchNearbyPlaces = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/nearby-places');
      setNearbyPlaces(response.data.results);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
    }
  };
  

  // Fetch pre-existing places (from your backend)
  const fetchFoods = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/food');
      setFoods(response.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews for a place
  const fetchReviews = async (placeName) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/reviews/${placeName}`);
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

  useEffect(() => {
    fetchFoods();
    fetchNearbyPlaces();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  // Filter and sort nearby places based on search term and ratings
  const filteredNearbyPlaces = nearbyPlaces
    .filter(place => place.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.rating - a.rating);

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'} overflow-x-hidden`}>
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 flex items-center justify-between px-4 w-full">
        <button onClick={() => window.history.back()} className="px-3 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
          Back
        </button>
        <div className="flex-1 flex justify-center">
          <h1 className="text-2xl font-bold">Food Joints</h1>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button onClick={toggleDarkMode} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {darkMode ? <SunIcon className="text-yellow-500" /> : <MoonIcon className="text-blue-600" />}
          </motion.button>
          <motion.button onClick={() => navigate('/profile')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <UserIcon className="text-gray-800 dark:text-gray-200" />
          </motion.button>
        </div>
      </header>

      {/* Search and Filter Nearby Places */}
      <section className="my-8">
        <h2 className="text-2xl font-bold text-center mb-4">Places Near You (5km Radius)</h2>
        <input
          type="text"
          placeholder="Search for places"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="block w-full p-2 border rounded mb-4"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNearbyPlaces.map(place => (
            <div key={place.place_id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer">
              <img src={place.icon} alt={place.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h2 className="text-xl font-bold">{place.name}</h2>
                <p className="text-sm text-gray-400">Rating: {place.rating}/5</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline block"
                >
                  Get Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Most Loved Places */}
      <section className="my-8">
        <h2 className="text-2xl font-bold text-center mb-4">Most Loved Places</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map(activity => (
            <div key={activity._id} onClick={() => fetchReviews(activity.name)} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer">
              <img src={`data:image/jpeg;base64,${activity.image}`} alt={activity.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h2 className="text-xl font-bold">{activity.name}</h2>
                <p className="text-sm text-gray-400">Average Rating: {activity.avg_rating}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
{isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white text-black rounded-lg p-6 w-3/4 max-w-lg relative">
      <h2 className="text-2xl font-bold mb-4">{selectedPlace}</h2>
      
      {/* Google Maps Directions Link */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline mb-4 block"
      >
        Get Directions to {selectedPlace}
      </a>
      
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>

      {/* Close Modal Button */}
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded"
      >
        Close
      </button>

      {/* Reviews */}
      {reviews.length > 0 ? (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review._id} className="border-b pb-2 last:border-b-0">
              <p className="font-semibold">Rating: {review.rating}/5</p>
              <p className="italic">{review.review}</p>
              <p className="text-gray-500 text-sm">
                By: {review.username || 'Anonymous'}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No reviews available for this place.</p>
      )}
    </div>
  </div>
)}

    </div>
  );
};

export default Restaurants;
