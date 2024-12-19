import React, { useState } from "react";
import universeLogo from "/src/assets/UniVerse.png"; // Update with the actual logo path
import { FaSun, FaMoon } from "react-icons/fa"; // Install react-icons for icons

const QuizHome = () => {
  const [roomCode, setRoomCode] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleJoinRoom = () => {
    if (roomCode.trim() === "") {
      alert("Please enter a valid room code.");
      return;
    }
    console.log("Joining room with code:", roomCode);
    // Implement join room logic here
  };

  const handleCreateRoom = () => {
    if (quizTitle.trim() === "") {
      alert("Please enter a quiz title.");
      return;
    }
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one document.");
      return;
    }
    console.log("Creating room with title:", quizTitle);
    console.log("Uploaded files:", uploadedFiles);
    // Implement create room logic here
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      ["application/pdf", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)
    );

    if (files.length !== e.target.files.length) {
      alert("Only PDF, PPT, and DOC files are allowed.");
    }

    setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"} min-h-screen`}>
      {/* Header */}
      <header className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-md py-4`}>
        <div className="container mx-auto flex items-center justify-between px-6">
          <div className="flex items-center">
            <img src={universeLogo} alt="UniVerse Logo" className="h-10" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to Quiz Room</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            {darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-700" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Join Quiz Room */}
        <section className={`${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"} rounded-lg shadow p-6`}>
          <h2 className="text-xl font-semibold mb-4">Join a Quiz Room</h2>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Enter room code..."
            className={`${darkMode ? "bg-gray-700 text-gray-100" : "bg-white"} w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring mb-4`}
          />
          <button
            onClick={handleJoinRoom}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Join Room
          </button>
        </section>

        {/* Create Quiz Room */}
        <section className={`${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"} rounded-lg shadow p-6`}>
          <h2 className="text-xl font-semibold mb-4">Create a New Quiz Room</h2>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Enter quiz title..."
            className={`${darkMode ? "bg-gray-700 text-gray-100" : "bg-white"} w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring mb-4`}
          />
          <input
            type="file"
            accept=".pdf, .pptx, .docx"
            multiple
            onChange={handleFileUpload}
            className={`${darkMode ? "bg-gray-700 text-gray-100" : "bg-white"} w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring mb-4`}
          />
          <ul className="mb-4">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="text-sm">
                {file.name}
              </li>
            ))}
          </ul>
          <button
            onClick={handleCreateRoom}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Create Room
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className={`${darkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"} shadow-md py-4`}>
        <div className="container mx-auto text-center text-sm">
          © 2024 Quiz Room. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default QuizHome;
