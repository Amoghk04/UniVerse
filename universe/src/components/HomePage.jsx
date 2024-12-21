// Import necessary libraries
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpenIcon, 
  UsersIcon, 
  UniversityIcon, 
  SunIcon, 
  MoonIcon, 
  UserIcon, 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || false
  );
  const navigate = useNavigate();

  // Theme management with local storage
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

  const sections = [
    {
      id: 'education',
      title: 'Education',
      icon: BookOpenIcon,
      description: 'Collaborative learning ecosystem with AI-powered tools',
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    },
    {
      id: 'socials',
      title: 'Socials',
      icon: UsersIcon,
      description: 'Connect, discover, and engage with your community',
      color: 'bg-gradient-to-br from-green-500 to-teal-600',
    },
    {
      id: 'college-life',
      title: 'College Life',
      icon: UniversityIcon,
      description: 'Dynamic platform for campus experiences',
      color: 'bg-gradient-to-br from-pink-500 to-purple-600',
    }
  ];

  return (
    <div className={`
      min-h-screen transition-all duration-500 
      ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}
      overflow-x-hidden
    `}>
      {/* Responsive Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img
              src="./src/assets/UniVerse.png" // Replace with the correct image path
              alt="Login Image"
              className="w-52 h-25 mx-auto my-4 mb-3 rounded-2xl border-2 border-white/10"
            />
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
              onClick={() => navigate('/profile')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <UserIcon className="text-gray-800 dark:text-gray-200" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-4xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
        >
          Welcome to UniVerse
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {sections.map((section) => (
            <motion.div 
              key={section.id}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              className={`
                ${section.color} 
                text-white rounded-xl p-6 shadow-lg 
                transform transition-all duration-200 
                hover:shadow-xl cursor-pointer
                relative overflow-hidden
              `}
              onClick={() => navigate(`/${section.id}`)}
            >
              <div className="flex flex-col items-center">
                <section.icon size={48} className="mb-4" />
                <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                <p className="text-sm opacity-80 text-center">{section.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;