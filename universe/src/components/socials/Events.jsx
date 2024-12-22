import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserIcon, PlusCircleIcon, X, Calendar, Ticket, IndianRupee, Mail  } from "lucide-react";
import axios from "axios";

const Events = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || false
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // Modal for event details
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    eventname: "",
    tnum: "",
    contact: "",
    ctype:"",
    category: "",
    price:"",
    eventdate:"",
    image: null,
    username: localStorage.getItem("currentUsername"),
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://20.197.34.29:5000/tickets");
        console.log(response.data);
        if (response.data.success) {
          setEvents(response.data.data);
        } else {
          console.error("Failed to fetch events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

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
  const types =["Instagram", "Twitter", "Mail ID", "Phone No.", "Other"];
  const filteredEvents = selectedCategory === "All" ? events : events.filter(event => event.category === selectedCategory);

  const handleAddTicket = async (e) => {
    e.preventDefault();

    try {
      const formDataObj = new FormData();
      formDataObj.append("eventname", formData.eventname);
      formDataObj.append("eventdate", formData.eventdate);
      formDataObj.append("price", formData.price);
      formDataObj.append("contact", formData.contact);
      formDataObj.append("ctype",formData.ctype)
      formDataObj.append("tnum", formData.tnum);
      formDataObj.append("category", formData.category);
      formDataObj.append("username",formData.username);
      if (formData.image) {
        formDataObj.append("image", formData.image);
      }

      const response = await axios.post("http://20.197.34.29:5000/add_ticket", formDataObj, {
        
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

  const EventDetailsModal = ({ event, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row"
      >
        {/* Left side - Image */}
        <div className="md:w-1/2 relative">
          <img
            src={`data:image/jpeg;base64,${event.image}`}
            alt={event.eventname}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Right side - Details */}
        <div className="md:w-1/2 p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">{event.eventname}</h2>
            <div className="flex items-center text-gray-600 dark:text-gray-300 space-x-2">
              <Calendar className="w-5 h-5" />
              <span>
  {new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}
</span>

            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <Ticket className="w-5 h-5" />
              <span>{event.tnum} tickets available</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <IndianRupee className="w-5 h-5" />
              <span className="text-xl font-semibold">{event.price}</span>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">{event.ctype}:</span> {event.contact}
              </p>
            </div>
          </div>

          <div className="pt-4">
            <span className="inline-block px-4 py-2 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {event.category}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
      } overflow-x-hidden`}
    >
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 flex items-center justify-between px-4 w-full">
        <div className="flex-1 flex justify-center">
          <h1 className="text-2xl font-bold">Events</h1>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <UserIcon className="text-gray-800 dark:text-gray-200" />
          </motion.button>
        </div>
      </header>

      <div className="flex justify-center items-center">
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
              <PlusCircleIcon className="mr-1" />
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
                key={event.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${
                  darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                } p-6 rounded-xl shadow-lg flex flex-col items-center text-center cursor-pointer`}
                onClick={() => setSelectedEvent(event)}
              >
                <img 
                  src={`data:image/jpeg;base64,${event.image}`} 
                  alt={event.name} 
                  className={`w-full h-40 object-cover rounded-lg mb-4 ${darkMode ? 'opacity-80' : ''}`} 
                />
                <h2 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                  {event.name}
                </h2>
              </motion.div>
            ))}
          </main>

        </div>
      </div>

      {/* Modal for Event Details */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
  <div className="w-1/3 max-h-full overflow-auto bg-white p-2 rounded-lg">
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
                type="date"
                name="eventdate"
                placeholder="Event Date"
                value={formData.eventdate}
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
              <input
                type="number"
                name="price"
                placeholder="Price per ticket"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <select
                name="ctype"
                value={formData.ctype}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Contact Mode</option>
                {types.map((ctype) => (
                  <option key={ctype} value={ctype}>
                    {ctype}
                  </option>
                ))}
              </select>
              <textarea
                name="contact"
                placeholder="Contact Details (add link for other)"
                value={formData.contact}
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
        </div>
      )}
    </div>
  );
};

export default Events;
