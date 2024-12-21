import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircleIcon, XIcon, SearchIcon } from 'lucide-react';
import axios from 'axios';

const GamingComms = () => {
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGame, setNewGame] = useState({
    name: '',
    link: '',
    gameCode: '', // Added field for game code
    username: localStorage.getItem('currentUsername'),
    maxPlayers: '',
  });
  const [alertMessage, setAlertMessage] = useState('');
  const username = localStorage.getItem('currentUsername');
  const url = 'http://127.0.0.1:5000';

  useEffect(() => {
    axios
      .get(`${url}/${username}/games`)
      .then((response) => setGames(response.data))
      .catch((error) => console.error('Error fetching games:', error));
  }, []);

  const addGame = () => {
    axios
      .post(
        `${url}/${username}/games`,
        {
          gamename: newGame.name,
          gamelink: newGame.link,
          gamecode: newGame.gameCode, // Pass gameCode
          username: username,
          maxplayers: newGame.maxPlayers,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then((response) => {
        setGames([...games, response.data]);
        setNewGame({ name: '', link: '', gameCode: '', username: username, maxPlayers: '' });
        setIsModalOpen(false);
        setAlertMessage('Game added successfully!'); // Show success message
        setTimeout(() => setAlertMessage(''), 3000); // Hide the alert after 3 seconds
      })
      .catch((error) => {
        console.error('Error adding game:', error);
        setAlertMessage('Error adding game. Please try again.'); // Show error message
        setTimeout(() => setAlertMessage(''), 3000); // Hide the alert after 3 seconds
      });
  };

  const filteredGames = games.filter(
    (game) =>
      game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="
        min-h-screen bg-gradient-to-br from-green-50 to-blue-50 
        dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white
        transition-all duration-500
      "
    >
      {/* Header with Search */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Gaming Communities</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search games..."
                className="
                  pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                  text-gray-800 dark:text-gray-200 placeholder-gray-500
                  dark:placeholder-gray-400 focus:outline-none focus:ring-2
                  focus:ring-green-500 dark:focus:ring-green-400
                "
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
              className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
            >
              <PlusCircleIcon size={24} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="
                bg-gradient-to-br from-green-500 to-blue-600 text-white
                p-6 rounded-lg shadow-lg
                hover:shadow-xl transition-all
              "
            >
             <h3 className="text-xl font-bold mb-2">{game.name}</h3>
<p className="text-sm mb-2">
  Hosted by: <span className="font-medium">{game.username}</span>
</p>
<p className="text-sm mb-2">
  Max Players: <span className="font-medium">{game.maxPlayers}</span>
</p>

{/* Check if there's a link or a code */}
{game.link ? (
  <a
    href={game.link}
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm text-yellow-300 underline"
  >
    Join Game
  </a>
) : game.code ? (
  <p className="text-sm text-yellow-300">
    Game Code: <span className="font-medium">{game.code}</span>
  </p>
) : (
  <p className="text-sm text-red-500">No link or code available</p>
)}

            </motion.div>
          ))}
        </div>
      </main>

      {/* Modal for Adding Game */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add a Game</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <XIcon size={24} className="text-gray-800 dark:text-gray-200" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Game Name</label>
              <input
                type="text"
                className="
                  w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700
                  text-gray-900 dark:text-gray-200 focus:outline-none
                  focus:ring-2 focus:ring-green-500
                "
                value={newGame.name}
                onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Game Link</label>
              <input
                type="text"
                className="
                  w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700
                  text-gray-900 dark:text-gray-200 focus:outline-none
                  focus:ring-2 focus:ring-green-500
                "
                value={newGame.link}
                onChange={(e) => setNewGame({ ...newGame, link: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Game Code</label>
              <input
                type="text"
                className="
                  w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700
                  text-gray-900 dark:text-gray-200 focus:outline-none
                  focus:ring-2 focus:ring-green-500
                "
                value={newGame.gameCode}
                onChange={(e) => setNewGame({ ...newGame, gameCode: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Max Players</label>
              <input
                type="number"
                className="
                  w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700
                  text-gray-900 dark:text-gray-200 focus:outline-none
                  focus:ring-2 focus:ring-green-500
                "
                value={newGame.maxPlayers}
                onChange={(e) => setNewGame({ ...newGame, maxPlayers: e.target.value })}
              />
            </div>
            <motion.button
              onClick={addGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
            >
              Add Game
            </motion.button>
          </div>
        </div>
      )}

      {/* Alert Message */}
      {alertMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-md shadow-md">
          {alertMessage}
        </div>
      )}
    </div>
  );
};

export default GamingComms;
