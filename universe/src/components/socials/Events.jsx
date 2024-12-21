import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SunIcon, MoonIcon, UserIcon, SparklesIcon } from "lucide-react";
import axios from "axios";

const Events = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [events, setEvents] = useState([
    { id: 1, title: "Music Festival", category: "Music", description: "Enjoy live music and great vibes.", image: "https://via.placeholder.com/150" },
    { id: 2, title: "Art Exhibition", category: "Art", description: "Explore stunning art from local artists.", image: "https://via.placeholder.com/150" },
    { id: 3, title: "Food Carnival", category: "Theatre", description: "Savor delicious dishes from around the world.", image: "https://via.placeholder.com/150" },
    { id: 4, title: "Movie Night", category: "Movies", description: "Watch the latest blockbusters!", image: "https://via.placeholder.com/150" },
  ]);

  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    eventname: "",
    tnum: "",
    message: "",
    category: "",
    image: null,
    username: localStorage.getItem("currentUsername"),
  });

  const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal open/close

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

  const categories = ["All", "Music", "Movies", "Stand-Up Comedy", "Theatre", "Art", "Other"];
  const filteredEvents = selectedCategory === "All" ? events : events.filter(event => event.category === selectedCategory);

  const handleAddTicket = async (e) => {
    e.preventDefault();

    try {
      const formDataObj = new FormData();
      formDataObj.append("eventname", formData.eventname);
      formDataObj.append("tnum", formData.tnum);
      formDataObj.append("message", formData.message);
      formDataObj.append("category", formData.category);
      formDataObj.append("image", formData.image);
      formDataObj.append("username",formData.username);
      if (formData.image) {
        formDataObj.append("image", formData.image);
      }

      const response = await axios.post("http://127.0.0.1:5000/add_ticket", formDataObj, {
        
      });

      if (response.data.success) {
        alert("Ticket added successfully");
        setIsModalOpen(false); // Close modal after adding the ticket
      } else {
        alert("Failed to add ticket");
      }
    } catch (error) {
      console.error("Error adding ticket:", error);
      alert("Error occurred while adding ticket.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: e.target.files[0] });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
      } overflow-x-hidden`}
    >
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 flex items-center justify-between px-4 w-full">
        <button
          onClick={() => window.history.back()}
          className="px-3 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
        >
          Back
        </button>
        <div className="flex-1 flex justify-center">
          <h1 className="text-2xl font-bold">Events</h1>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={toggleDarkMode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <SunIcon className="text-yellow-500" /> : <MoonIcon className="text-blue-600" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <UserIcon className="text-gray-800 dark:text-gray-200" />
          </motion.button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        <div className="px-4 py-6">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Live Tickets
          </motion.h2>
<div>
          <div className="relative mb-4 flex justify-between items-center space-x-4">
            <input
              type="text"
              placeholder="Search tickets..."
              className="flex-grow px-4 py-2 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.button
              onClick={() => setIsModalOpen(true)} // Open the modal when clicking the button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
              title="Add Ticket"
            >
              <SparklesIcon className="mr-1" />
            </motion.button>
          </div>

          {/* Categories */}
          <section className="bg-gray-100 dark:bg-gray-800 py-6 rounded-lg mb-6">
            <div className="flex justify-center space-x-4 overflow-x-auto px-4">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2 rounded-full ${
                    selectedCategory === category
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  } transition-colors`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </section>
</div>
          {/* Events Grid */}
          <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-black to-gray-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h2 className="text-lg font-bold mb-2">{event.title}</h2>
                <p className="text-white mb-4">{event.description}</p>
                <button className="px-4 py-2 bg-white text-blue-600 rounded-full hover:bg-gray-100 transition">
                  Learn More
                </button>
              </motion.div>
            ))}
          </main>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Add Ticket</h2>
            <form onSubmit={handleAddTicket} className="space-y-4">
              <input
                type="text"
                name="eventname"
                placeholder="Event Name"
                value={formData.eventname}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                name="tnum"
                placeholder="Number of Tickets"
                value={formData.tnum}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <textarea
                name="message"
                placeholder="Message/Contact Details"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              ></textarea>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="space-y-1">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {imagePreview && <img src={imagePreview} alt="Image Preview" className="mt-4 max-w-xs rounded-lg" />}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
