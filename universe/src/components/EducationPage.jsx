import React from 'react';
import { useNavigate } from 'react-router-dom';

const EducationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 flex items-center justify-between px-4">
        <button 
          onClick={() => navigate('/')} 
          className="px-3 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
        >
          Back
        </button>
        <h1 className="text-2xl font-bold">Education</h1>
        <div className="w-12"></div>
      </header>
      <main className="container mx-auto px-4 py-12">
        <ul className="space-y-4 text-center">
          <li className="text-xl font-bold">Smart Notes Repository</li>
          <li className="text-xl font-bold">AI Academic Search</li>
          <li className="text-xl font-bold">Interactive Quiz Rooms</li>
        </ul>
      </main>
    </div>
  );
};

export default EducationPage;
