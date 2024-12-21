import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchIcon, X } from "lucide-react";
import axios from "axios";

const AlumniNetwork = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || false
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [alumni, setAlumni] = useState([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounced search function
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
      // Ensure each alumni object has the required properties
      const processedAlumni = response.data.map(alumnus => ({
        ...alumnus,
        companies: alumnus.companies || [],
        skills: alumnus.skills || [],
        email: alumnus.email || 'N/A',
        name: alumnus.name || 'Unknown'
      }));
      setAlumni(processedAlumni);
    } catch (error) {
      setError("Failed to fetch alumni data");
      console.error("Error fetching alumni:", error);
      setAlumni([]); // Reset alumni on error
    } finally {
      setLoading(false);
    }
  };

  // Dark mode handling
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
    } overflow-y-auto`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 flex items-center justify-between px-4 w-full">
        
        <div className="flex-1 flex justify-center">
          <h1 className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">Alumni Network</h1>
        </div>
        
      </header>

      {/* Search Section */}
      <div className="px-4 py-6">
        <div className="relative mb-6 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search by name, company, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-10 rounded-lg bg-white dark:bg-gray-700 
                     text-gray-900 dark:text-white shadow-md focus:outline-none 
                     focus:ring-2 focus:ring-blue-500"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 
                                text-gray-400 dark:text-gray-300" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="text-gray-400 dark:text-gray-300" />
            </button>
          )}
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-4">Loading alumni...</div>
        )}
        {error && (
          <div className="text-center py-4 text-red-500">{error}</div>
        )}

        {/* Alumni Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {alumni.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No alumni found
              </div>
            ) : (
              alumni.map((alumnus, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => setSelectedAlumni(alumnus)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 
                           cursor-pointer hover:shadow-xl transition-shadow"
                >
                  <h3 className="text-xl font-bold mb-2">{alumnus.name}</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Companies:</strong> {alumnus.companies?.join(", ") || "No companies listed"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Skills:</strong> {alumnus.skills?.join(", ") || "No skills listed"}
                    </p>
                  </div>
                </motion.div>
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
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
            onClick={() => setSelectedAlumni(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row"
            >
              {/* Left side - Image or Placeholder */}
              <div className="md:w-1/2 p-6 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <div className="text-center text-gray-500 dark:text-gray-300">
                  <span className="text-lg">No Image</span>
                </div>
              </div>

              {/* Right side - Alumni Details */}
              <div className="md:w-1/2 p-6 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold">{selectedAlumni.name}</h2>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Email:</strong> {selectedAlumni.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Companies:</strong> {selectedAlumni.companies?.join(", ") || "No companies listed"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Skills:</strong> {selectedAlumni.skills?.join(", ") || "No skills listed"}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedAlumni(null)}
                    className="px-4 py-2 rounded-full bg-blue-600 text-white dark:bg-blue-700"
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