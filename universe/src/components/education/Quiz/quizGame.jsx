import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const QuizGame = () => {
  const [socket, setSocket] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [responses, setResponses] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(10);
  const [usersAnswered, setUsersAnswered] = useState([]);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || false
  );
  const roomCode = '0000'; // example room code
  localStorage.setItem('roomCode', roomCode);
  const navigate = useNavigate();

  const questions = [
    {
      question: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Madrid"],
      answer: "Paris",
    },
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      answer: "4",
    },
    {
      question: "Which programming language is known as 'Python'?",
      options: ["Java", "C++", "Python", "Ruby"],
      answer: "Python",
    },
  ];

  useEffect(() => {
    const newSocket = io("http://20.197.34.29:5000");
    setSocket(newSocket);

    var url = `http://20.197.34.29:5000/rooms/${roomCode}`;
    console.log(url);
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error("Room not found:", data.error);
        } else {
          setUsersInRoom(data.users);
        }
      })
      .catch((error) => console.error("Error fetching room info:", error));

    newSocket.emit("join_room", { roomCode });

    newSocket.on("user_joined", (data) => {
      setUsersInRoom((prev) => [...prev, data.username]);
    });

    newSocket.on("user_left", (data) => {
      setUsersInRoom((prev) => prev.filter((user) => user !== data.username));
    });

    newSocket.on("user_response", (data) => {
      setResponses((prev) => [...prev, data]);
      setUsersAnswered((prev) => [...prev, data.username]);
    });

    newSocket.on("next_question", () => {
      setShowResults(false);
      setSelectedOption(null);
      setResponses([]);
      setUsersAnswered([]);
      setTimer(10);
    });

    return () => newSocket.close();
  }, [roomCode]);

  useEffect(() => {
    if (timer > 0 && !showResults) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !showResults) {
      handleEndQuestion();
    }
  }, [timer, showResults]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    if (socket) {
      socket.emit("submit_response", {
        username: localStorage.getItem("username"),
        answer: option,
        questionIndex: currentQuestionIndex,
      });
    }
  };

  const handleBackToLobby = () => {
    navigate('/education/quiz');
  };
  
  const handleQuitRoom = () => {
    navigate('/education');
  };

  const handleEndQuestion = () => {
    setShowResults(true);
    const currentQuestion = questions[currentQuestionIndex];
  
    // Add null check for responses
    const correctResponses = responses?.filter(
      (response) => response?.answer === currentQuestion?.answer
    ) || [];
  
    // Add null check for selectedOption
    if (selectedOption && currentQuestion && selectedOption === currentQuestion.answer) {
      setScore((prev) => prev + 1);
    }
  
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setShowResults(false);
        setSelectedOption(null);
        setTimer(10);
        setResponses([]);
      } else {
        setGameOver(true);
      }
    }, 5000);
  };

  return (
    <div
    style={{
      fontFamily: "Arial, sans-serif",
      padding: "20px",
      backgroundColor: darkMode ? "#1a202c" : "#f9f9f9", // Use the actual color code
      color: darkMode ? "#f0f0f0" : "#000",
      minHeight: "100vh",
    }}    
    >
      <header
        style={{
          display: "flex",
          justifyContent: "center",  // Center horizontally
          alignItems: "flex-start",   // Align to the top
          padding: "20px 40px",
        }}
      >
        <div>
          <h1 style={{
            fontSize: "3rem",
            fontWeight: "bold",
            textAlign: "center",       // Center text inside the heading
          }}>
            Welcome to the Quiz
          </h1>
        </div>
      </header>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          height: "80vh",
          textAlign: "center",
        }}
      >
        {gameOver ? (
  <div className="flex flex-col items-center justify-center">
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold mb-4">
        Game Over!
      </h2>
      <p className="text-2xl font-semibold mb-8">
        Your score: {score} / {questions.length}
      </p>
    </div>
    
    <div className="flex gap-4">
      <motion.button
        onClick={handleBackToLobby}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 text-lg font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
      >
        Back to Lobby
      </motion.button>

      <motion.button
        onClick={handleQuitRoom}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 text-lg font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
      >
        Quit Room
      </motion.button>
    </div>
  </div>
): (
          <div>
            <h2 style={{ fontSize: "2.5rem" }}>{questions[currentQuestionIndex].question}</h2>
            <div style={{ marginTop: "30px" }}>
              {questions[currentQuestionIndex].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  disabled={showResults}
                  style={{
                    margin: "10px",
                    padding: "15px",
                    backgroundColor:
                      showResults && option === questions[currentQuestionIndex].answer
                        ? "#28a745"
                        : selectedOption === option
                        ? "#007BFF"
                        : "#f0f0f0",
                    color:
                      showResults && option === questions[currentQuestionIndex].answer
                        ? "#fff"
                        : selectedOption === option
                        ? "#fff"
                        : "#000",
                    border: "1px solid #ddd",
                    cursor: showResults ? "not-allowed" : "pointer",
                    fontSize: "1.2rem",
                    borderRadius: "5px",
                    width: "80%",
                    maxWidth: "500px",
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            <h3 style={{ marginTop: "20px", fontSize: "1.5rem" }}>Time Left: {timer} seconds</h3>
            {showResults}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGame;
