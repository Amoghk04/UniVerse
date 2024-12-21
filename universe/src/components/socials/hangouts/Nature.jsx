import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { UserIcon} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Nature = () => {
  const [nature, setNature] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || false
  );

// Search state
  const [query, setQuery] = useState("");
  const [filteredNature, setFilteredNatures] = useState([]);

  const fetchNature = async () => {
    try {
      const response = await axios.get('http://20.197.34.29:5000/nature');
      setNature(response.data);
      setFilteredNatures(response.data);
    } catch (error) {
      console.error('Error fetching nature:', error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchNature();
  }, []);

  useEffect(() => {
      
      if (query.trim() === "") {
        setFilteredNatures(nature); }
      else{setFilteredNatures(
          nature.filter((np) =>
            np.name.toLowerCase().includes(query.toLowerCase())
          )
        );
      }
    }, [query, nature]);
  

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


  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }



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
          <h1 className="text-2xl font-bold">&nbsp;&nbsp;&nbsp;Nature</h1>
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

      {/* Search Bar */}
      <div className="flex justify-center py-6">
        <input
          type="text"
          placeholder="Search for a place..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-lg p-2 border rounded-md shadow focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {filteredNature.length > 0 ? (
          filteredNature.map((np) => (
            <motion.div
              key={np.id}
              className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => fetchReviews(np.name)}
            >
              <img
                src={`data:image/jpeg;base64,${np.image}`}
                alt={np.name}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
              <h2 className="font-bold text-lg">{np.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {np.type}
              </p>
            </motion.div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No places found.
          </p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white text-black rounded-lg p-6 w-3/4 max-w-lg">
          {/* Google Maps Directions Link */}
          <h2 className="text-2xl font-bold mb-4"> {selectedPlace}</h2>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline mb-4 block"
        >
          Get Directions to {selectedPlace}
        </a>
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded"
            >
              Close
            </button>

            <div className="mb-6">
              {/* Full Image in Review Modal */}
              <img
                src={`data:image/jpeg;base64,${nature.find(r => r.name === selectedPlace)?.image}`}
                alt={selectedPlace}
                className="w-full object-contain rounded-lg"  // ensures full image visibility
              />
            </div>

            {reviews.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                <ul className="space-y-4">
                  {reviews.map((review) => (
                    <li
                      key={review._id}
                      className="border-b pb-2 last:border-b-0"
                    >
                      <p className="font-semibold">Rating: {review.rating}/5</p>
                      <p className="italic">{review.review}</p>
                      <p className="text-gray-500 text-sm">
                        By: {review.username || 'Anonymous'}
                      </p>
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
    </div>
  );
};

export default Nature;
