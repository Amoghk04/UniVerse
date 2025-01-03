// Import necessary libraries
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpenIcon, SearchIcon, FileTextIcon } from 'lucide-react';

const EducationPage = () => {
  const navigate = useNavigate();

  const widgets = [
    {
      id: 'smart-notes',
      title: 'Smart Notes Repository',
      icon: BookOpenIcon,
      description: 'Access and organize your notes efficiently.',
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    },
    {
      id: 'notes',
      title: 'Assignments and Notes',
      icon: SearchIcon,
      description: 'Add the notes and assignments for you courses',
      color: 'bg-gradient-to-br from-green-500 to-teal-600',
    },
    {
      id: 'quiz',
      title: 'Interactive Quiz Rooms',
      icon: FileTextIcon,
      description: 'Engage in interactive and gamified quizzes.',
      color: 'bg-gradient-to-br from-pink-500 to-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <main className="container mx-auto px-4 py-12">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
        >
          Education
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              className={`
                ${widget.color} 
                text-white rounded-xl p-6 shadow-lg 
                transform transition-all duration-200 
                hover:shadow-xl cursor-pointer
              `}
              onClick={() => navigate(`/education/${widget.id}`)}
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

export default EducationPage;
