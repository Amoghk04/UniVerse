import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, UserCircle } from "lucide-react";
import axios from "axios";

const AlumniCard = ({ alumnus, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    onClick={() => onClick(alumnus)}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 
               cursor-pointer hover:shadow-xl transition-shadow"
  >
    <div className="flex items-center gap-4 mb-4">
      {alumnus.profileImage ? (
        <img
          src={`data:image/jpeg;base64,${alumnus.profileImage}`}
          alt={`${alumnus.name}'s profile`}
          className="w-12 h-12 rounded-full object-cover"
        />
      ) : (
        <UserCircle className="w-12 h-12 text-gray-400" />
      )}
      <h3 className="text-xl font-bold">{alumnus.name}</h3>
    </div>
    <div className="space-y-2">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        <strong>Year:</strong> {alumnus.yearPassOut}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        <strong>Companies:</strong> {alumnus.companies.join(", ") || "No companies listed"}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        <strong>Skills:</strong> {alumnus.skills.join(", ") || "No skills listed"}
      </p>
    </div>
  </motion.div>
);

AlumniCard.propTypes = {
  alumnus: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    yearPassOut: PropTypes.string.isRequired,
    companies: PropTypes.arrayOf(PropTypes.string).isRequired,
    skills: PropTypes.arrayOf(PropTypes.string).isRequired,
    profileImage: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func.isRequired
};

const AlumniNetwork = () => {
  const [darkMode, setDarkMode] = useState(() => 
    localStorage.getItem("theme") === "dark"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [alumni, setAlumni] = useState([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchAlumni(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const fetchAlumni = async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/alumniFetchAll?search=${encodeURIComponent(search)}`
      );
      console.log(response.data);  // Log the response to check the structure
      setAlumni(response.data);
    } catch (error) {
      setError("Failed to fetch alumni data");
      console.error("Error fetching alumni:", error);
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newMode);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
    }`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
            Alumni Network
          </h1>
        </div>
      </header>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, company, skills, or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-10 rounded-lg 
                     bg-white dark:bg-gray-700 
                     text-gray-900 dark:text-white 
                     shadow-md focus:outline-none 
                     focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
          </div>
        )}
        
        {error && (
          <div className="text-center py-8 text-red-500">{error}</div>
        )}

        {/* Alumni Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No alumni found
              </div>
            ) : (
              alumni.map((alumnus, index) => (
                <AlumniCard 
                  key={`${alumnus.email}-${index}`} 
                  alumnus={alumnus}
                  onClick={setSelectedAlumni}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Alumni Detail Modal */}
      <AnimatePresence>
        {selectedAlumni && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedAlumni(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  {selectedAlumni.profileImage ? (
                    <img 
                    src={`data:image/jpeg;base64,${selectedAlumni.profileImage}`}
                      alt={`${selectedAlumni.name}'s profile`}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-24 h-24 text-gray-400" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{selectedAlumni.name}</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Class of {selectedAlumni.yearPassOut}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Contact</h3>
                    <p className="text-gray-600 dark:text-gray-300">{selectedAlumni.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Professional Experience</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedAlumni.companies.join(" → ")}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAlumni.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 
                                   text-blue-800 dark:text-blue-100 
                                   rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedAlumni(null)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 
                             text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlumniNetwork;