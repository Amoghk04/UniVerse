import React, { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import universeLogo from "/src/assets/UniVerse.png";
import { useNavigate } from 'react-router-dom';
import { FaSun, FaMoon } from "react-icons/fa";

const QuizRoom = () => {
  const [socket, setSocket] = useState(null);
  const [roomCode, setRoomCode] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [files, setUploadedFiles] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [roomUsers, setRoomUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [username, setUsername] = useState("");
  const [connected, setConnected] = useState(false);
  const user = localStorage.getItem("currentUsername");
  const navigate = useNavigate();

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://127.0.0.1:5000", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setConnected(true);
      
      // If we were in a room before reconnecting, rejoin it
      if (currentRoom && username) {
        newSocket.emit("rejoin_room", { roomCode: currentRoom, username });
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Room events
    socket.on("room_joined", (data) => {
      console.log("Room joined:", data);
      setRoomUsers(data.users);
      setCurrentRoom(data.roomCode);
    });

    socket.on("user_joined", (data) => {
      console.log("User joined:", data);
      setRoomUsers(data.users);
    });

    socket.on("user_left", (data) => {
      console.log("User left:", data);
      setRoomUsers(data.users);
    });

    socket.on("room_created", (data) => {
      console.log("Room created:", data);
      setCurrentRoom(data.roomCode);
      setRoomUsers([data.creator]);
    });

    socket.on("error", (error) => {
      console.error("Server error:", error);
      alert(`Error: ${error.message}`);
    });

    // Cleanup listeners
    return () => {
      socket.off("room_joined");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("room_created");
      socket.off("error");
    };
  }, [socket]);

  // Keep alive ping
  useEffect(() => {
    if (!socket || !currentRoom) return;

    const pingInterval = setInterval(() => {
      socket.emit("ping_room", { roomCode: currentRoom });
    }, 30000); // Send ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [socket, currentRoom]);

  const sendFilesToServer = async () => {
    if (files.length === 0) {
      alert("No files to upload.");
      return;
    }
    
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file); // Match the backend expectation
    });
  
    try {
      const response = await fetch(`http://127.0.0.1:5000/${user}/upload`, {
        method: "POST",
        body: formData,
        // Remove the Content-Type header - let the browser set it with boundary
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to upload files.");
      }
  
      const data = await response.json();
      console.log("Server Response:", data);
      alert("Files uploaded successfully!");
      setFiles([]); // Clear files after successful upload
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload files.");
    }
  };

  const handleJoinRoom = useCallback(() => {
    if (!socket || !connected) {
      alert("Not connected to server. Please try again.");
      return;
    }

    if (roomCode.trim() === "") {
      alert("Please enter a valid room code.");
      return;
    }

    const userInput = prompt("Enter your name:");
    if (!userInput) {
      alert("Name is required to join a room.");
      return;
    }

    setUsername(userInput);
    socket.emit("join_room", { roomCode, username: userInput });
  }, [socket, connected, roomCode]);

  const handleCreateRoom = useCallback(() => {
    if (!socket || !connected) {
      alert("Not connected to server. Please try again.");
      return;
    }

    if (quizTitle.trim() === "") {
      alert("Please enter a quiz title.");
      return;
    }
    if (files.length === 0) {
      alert("Please upload at least one document.");
      return;
    }

    const userInput = prompt("Enter your name (as room creator):");
    if (!userInput) {
      alert("Name is required to create a room.");
      return;
    }

    setUsername(userInput);
    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    socket.emit("create_room", {
      roomCode: newRoomCode,
      quizTitle,
      creator: userInput,
      files: files.map(f => f.name) // Send file info to server
    });

    setRoomCode(newRoomCode);
  }, [socket, connected, quizTitle, files]);

  const handleLeaveRoom = useCallback(() => {
    if (socket && currentRoom) {
      socket.emit("leave_room", { roomCode: currentRoom, username });
      setCurrentRoom(null);
      setRoomUsers([]);
      setUsername("");
    }
  }, [socket, currentRoom, username]);

  return (
    <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"} min-h-screen`}>
      {/* Header */}
      <header className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-md py-4`}>
        <div className="container mx-auto flex items-center justify-between px-6">
          <div className="flex items-center">
            <button onClick={() => navigate('/home')}>
              <img src={universeLogo} alt="UniVerse Logo" className="h-10" />
            </button>
            <div className="ml-4">
              {connected ? (
                <span className="text-green-500">●</span>
              ) : (
                <span className="text-red-500">●</span>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold">Welcome to Quiz Room</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            {darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-700" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      {!currentRoom ? (
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
              disabled={!connected}
              className={`w-full px-4 py-2 ${
                connected ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
              } text-white rounded-lg`}
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
              accept=".pdf,.pptx,.docx"
              multiple
              onChange={(e) => setUploadedFiles(Array.from(e.target.files))}
              className={`${darkMode ? "bg-gray-700 text-gray-100" : "bg-white"} w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring mb-4`}
            />
            <button
              onClick={() => {
                handleCreateRoom();
                sendFilesToServer();
              }}
              disabled={!connected}
              className={`w-full px-4 py-2 ${
                connected ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
              } text-white rounded-lg`}
            >
              Create Room
            </button>
          </section>
        </main>
      ) : (
        /* Lobby Section */
        <section className={`${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"} rounded-lg shadow p-6 m-6`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Quiz Room Lobby</h2>
            <button
              onClick={handleLeaveRoom}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Leave Room
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-lg font-medium">Room Code: 
                <span className="ml-2 font-bold text-blue-500">{currentRoom}</span>
              </p>
              <p className="text-lg font-medium mt-2">Your Name: 
                <span className="ml-2 font-bold text-green-500">{username}</span>
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Participants ({roomUsers.length})</h3>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 max-h-48 overflow-y-auto">
                {roomUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 py-1"
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>{user === username ? `${user} (You)` : user}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className={`${darkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"} shadow-md py-4 mt-auto`}>
        <div className="container mx-auto text-center text-sm">
          © 2024 Quiz Room. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default QuizRoom;