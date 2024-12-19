import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SunIcon, MoonIcon, UserIcon, SparklesIcon } from "lucide-react";

const Events = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [liveTickets, setLiveTickets] = useState([
    "RCB-CSK Match Tickets!",
    "Music Concert Passes",
    "Art Exhibition Entry",
  ]);

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

  const categories = ["All", "Music", "Movies", "Stand-Up Comedy", "Theatre", "Art"];
  const events = [
    { id: 1, title: "Music Festival", category: "Music", description: "Enjoy live music and great vibes.", image: "https://via.placeholder.com/150" },
    { id: 2, title: "Art Exhibition", category: "Art", description: "Explore stunning art from local artists.", image: "https://via.placeholder.com/150" },
    { id: 3, title: "Food Carnival", category: "Theatre", description: "Savor delicious dishes from around the world.", image: "https://via.placeholder.com/150" },
    { id: 4, title: "Movie Night", category: "Movies", description: "Watch the latest blockbusters!", image: "https://via.placeholder.com/150" },
  ];

  const filteredEvents = selectedCategory === "All" ? events : events.filter(event => event.category === selectedCategory);

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
        <h1 className="text-2xl font-bold">Events</h1></div>
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
        {/* Left Section */}
        <div className="lg:w-2/3 px-4 py-6">
        <motion.h2
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      Upcoming Events
                    </motion.h2>
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

        {/* Right Section */}
        <aside className="lg:w-1/3 px-4 py-6 rounded-lg">
          <motion.h2
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      Live Tickets
                    </motion.h2>
          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search tickets..."
              className="w-full px-4 py-2 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Live Tickets List */}
          <div className="space-y-4">
            {liveTickets.map((ticket, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md flex items-center justify-between"
              >
                <p className="text-gray-800 dark:text-gray-200">{ticket}</p>
              </motion.div>
            ))}
          </div>

          {/* Add Ticket Button */}
          <motion.button
            onClick={() => setLiveTickets([...liveTickets, "New Ticket"])}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 w-full px-4 py-2 flex items-center justify-center bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
          >
            <SparklesIcon className="mr-2" /> Add Ticket
          </motion.button>
        </aside>
      </div>
    </div>
  );
};

export default Events;
