// Import necessary libraries
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusCircleIcon, XIcon, SearchIcon } from "lucide-react";
import axios from "axios";

const RantPage = () => {
  const [rants, setRants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const url = "http://127.0.0.1:5000";


  useEffect(() => {
    axios
      .get(`${url}/rants`)
      .then((response) => setRants(response.data))
      .catch((error) => console.error("Error fetching rants:", error));
  }, []);

  
  const [blacklistedWords, setBlacklistedWords] = useState([]);
  const [newRant, setNewRant] = useState({ title: "", content: "" });
  const [error, setError] = useState("");
 

  const containsBlacklistedWords = (text) => {
    // Split the text into individual words
    const wordsInText = text.toLowerCase().split(/\s+/); // Splits by spaces or other whitespace
    // Find flagged words by checking for exact matches
    const flaggedWords = blacklistedWords.filter((word) =>
      wordsInText.includes(word.toLowerCase())
    );
    console.log("Flagged words:", flaggedWords); // Debugging
    return flaggedWords.length > 0;
  };
  

  useEffect(() => {
    // Fetch blacklisted words from the backend
    axios
      .get(`${url}/blacklisted-words`)
      .then((response) => setBlacklistedWords(response.data))
      .catch((error) => console.error("Error fetching blacklist:", error));
  }, []);
  const addPost = () => {
    if (!newRant.title || !newRant.content) {
      setErrorMessage("Both title and content are required.");
      return;
    }

    if (containsBlacklistedWords(newRant.title) || containsBlacklistedWords(newRant.content)) {
      setErrorMessage("Your post contains inappropriate or blacklisted words.");
      return;
    }

    
    const formData = new FormData();
    formData.append("rantTitle", newRant.title);
    formData.append("rant", newRant.content);

    axios
      .post(`${url}/rants`, formData, {
        headers: { "Content-Type": "application/json" },
      })
      .then(() => {
        axios.get(`${url}/rants`).then((response) => {
          setRants(response.data);
          setNewRant({ title: "", content: "" });
          setIsModalOpen(false);
          setErrorMessage("");
        });
      })
      .catch((error) => console.error("Error adding rant:", error));
  };

  const filteredRants = rants.filter(
    (rant) =>
      rant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rant.rant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-all duration-500">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Anonymous Posts
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search posts..."
                className="pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchIcon
                className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400"
                size={20}
              />
            </div>
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
            >
              <PlusCircleIcon size={24} />
            </motion.button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRants.map((rant, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <h3 className="text-xl font-bold mb-2">{rant.title}</h3>
              <p className="text-sm opacity-90">{rant.rant}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add a Post</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <XIcon size={24} className="text-gray-800 dark:text-gray-200" />
              </button>
            </div>
            {errorMessage && (
              <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Post Title</label>
              <input
                type="text"
                className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newRant.title}
                onChange={(e) => setNewRant({ ...newRant, title: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Post Content</label>
              <textarea
                className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                value={newRant.content}
                onChange={(e) => setNewRant({ ...newRant, content: e.target.value })}
              ></textarea>
            </div>
            <motion.button
              onClick={addPost}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Add Posts
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RantPage;

