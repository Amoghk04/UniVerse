import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenIcon, 
  UsersIcon, 
  HeartIcon, 
  SunIcon, 
  MoonIcon, 
  SparklesIcon 
} from 'lucide-react';

const HomePage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

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
      features: [
        'Smart Notes Repository',
        'AI Academic Search',
        'Interactive Quiz Rooms'
      ]
    },
    {
      id: 'socials',
      title: 'Socials',
      icon: UsersIcon,
      description: 'Connect, discover, and engage with your community',
      color: 'bg-gradient-to-br from-green-500 to-teal-600',
      features: [
        'Alumni Network',
        'Local Hangout Discoveries',
        'Event Connections'
      ]
    },
    {
      id: 'college-life',
      title: 'College Life',
      icon: HeartIcon,
      description: 'Dynamic platform for campus experiences',
      color: 'bg-gradient-to-br from-pink-500 to-purple-600',
      features: [
        'Smart Matching Platform',
        'Gaming Communities',
        'Club Interaction Spaces'
      ]
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
            <SparklesIcon className="text-blue-600 dark:text-blue-400" size={32} />
            <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              UniVerse
            </h1>
          </div>
          
          <motion.button 
            onClick={toggleDarkMode}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <SunIcon className="text-yellow-500" /> : <MoonIcon className="text-blue-600" />}
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <motion.h2 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
        >
          Choose Your Campus Experience
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {sections.map((section) => (
            <motion.div 
              key={section.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: sections.findIndex(s => s.id === section.id) * 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                ${section.color} 
                text-white rounded-2xl p-6 shadow-2xl 
                transform transition-all duration-300 
                hover:shadow-2xl cursor-pointer
                relative overflow-hidden
              `}
              onClick={() => setSelectedSection(section.id)}
            >
              <div className="relative z-10">
                <section.icon size={48} className="mb-4" />
                <h3 className="text-2xl font-bold mb-2">{section.title}</h3>
                <p className="text-sm opacity-80 mb-4">{section.description}</p>
                
                <ul className="space-y-1 text-xs opacity-90">
                  {section.features.map((feature) => (
                    <li key={feature} className="flex items-center space-x-2">
                      <SparklesIcon size={12} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2024 Ramaiah Institute of Technology Social Platform
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;