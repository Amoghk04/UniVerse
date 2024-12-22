// Import necessary libraries
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GamepadIcon, UsersIcon, FileLock2 } from 'lucide-react';

const CollegeLifePage = () => {
  const navigate = useNavigate();

  const widgets = [
    {
      id: 'ranting',
      title: 'Anonymous Postings',
      icon: FileLock2,
      description: 'Post absolutely anything, from teachers to classmates to friends...',
      color: 'bg-gradient-to-br from-red-900 to-orange-600',
      action: () => navigate('/posts'), // Placeholder action
    },
    {
      id: 'gaming',
      title: 'Gaming Communities',
      icon: GamepadIcon,
      description: 'Join gaming communities and play together.',
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      action: () => navigate('/gaming-communities'), // Navigates to GamingCommunities
    },
    {
      id: 'clubs',
      title: 'Club Interaction Spaces',
      icon: UsersIcon,
      description: 'Participate in club activities and events.',
      color: 'bg-gradient-to-br from-green-500 to-teal-600',
      action: () => navigate('/club-interaction-spaces'), // Navigates to ClubInteractionSpaces
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 flex items-center justify-between px-4 w-full">
        
        <div className="flex-1 flex justify-center">
          <h1 className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">College</h1>
        </div>
        <div className="flex items-center space-x-4">
         
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
        >
          Experience College Life
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.01 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              className={`
                ${widget.color} 
                text-white rounded-xl p-6 shadow-lg 
                transform transition-all duration-200 
                hover:shadow-xl cursor-pointer
              `}
              onClick={widget.action}
            >
              <div className="flex flex-col items-center">
                <widget.icon size={48} className="mb-4" />
                <h3 className="text-xl font-bold mb-2">{widget.title}</h3>
                <p className="text-sm text-center">{widget.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CollegeLifePage;
