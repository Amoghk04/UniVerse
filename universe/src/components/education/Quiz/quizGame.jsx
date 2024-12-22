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

  // State to hold fetched questions
  const [questions, setQuestions] = useState([]);

  // Fetch questions from the backend
  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/questions'); // Update with your actual endpoint
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setQuestions(data); // Assuming data is an array of question objects
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    fetchQuestions(); // Fetch questions when the component mounts

    const newSocket = io("http://127.0.0.1:5000");
    setSocket(newSocket);

    var url = `http://127.0.0.1:5000/rooms/${roomCode}`;
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
      resetQuestionState();
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

    // Ensure we have valid questions and responses
    if (questions.length > currentQuestionIndex) {
      const currentQuestion = questions[currentQuestionIndex];

      // Check for correct responses
      const correctResponses = responses.filter(
        (response) => response.answer === currentQuestion.answer
      );

      // Update score based on selected option
      if (selectedOption && selectedOption === currentQuestion.answer) {
        setScore((prev) => prev + 1);
      }

      // Move to next question or end game
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          resetQuestionState();
        } else {
          setGameOver(true);
        }
      }, 5000);
    }
  };

  // Reset question state for next question
  const resetQuestionState = () => {
    setShowResults(false);
    setSelectedOption(null);
    setResponses([]);
    setTimer(10);
  };

  return (
    <div style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        backgroundColor: darkMode ? "#1a202c" : "#f9f9f9",
        color: darkMode ? "#f0f0f0" : "#000",
        minHeight: "100vh",
      }}    
    >
      <header style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "20px 40px",
        }}
      >
        <div>
          <h1 style={{
            fontSize: "3rem",
            fontWeight: "bold",
            textAlign: "center",
          }}>
            Welcome to the Quiz
          </h1>
        </div>
      </header>
      
      <div style={{
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
              <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
              <p className="text-2xl font-semibold mb-8">Your score: {score} / {questions.length}</p>
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
        ) : (
          questions.length > currentQuestionIndex && (
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
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default QuizGame;
