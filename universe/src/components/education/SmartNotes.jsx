import React, { useState, useEffect } from "react";
import universeLogo from "/src/assets/UniVerse.png"; // Replace with your logo
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SunIcon, MoonIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

const RAGInterface = () => {
  const [files, setFiles] = useState([]);
  const [chat, setChat] = useState([]);
  const [query, setQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({
    show: false,
    message: "",
    isError: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState({
    show: false,
    message: "",
    isError: false,
  });
  const [isTyping, setIsTyping] = useState(false); // Typing animation state
  const navigate = useNavigate();
  const user = localStorage.getItem("currentUsername");

  // Theme management with local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newMode);
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files).filter((file) =>
      [
        "application/pdf",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(file.type)
    );

    if (files.length !== e.target.files.length) {
      alert("Only PDF, PPT, and DOC files are allowed.");
    }

    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
  };

  const sendFilesToServer = async () => {
    if (files.length === 0) {
      alert("No files to upload.");
      return;
    }

    setIsUploading(true);
    setUploadStatus({ show: false, message: "", isError: false });

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    try {
      const response = await fetch(`http://127.0.0.1:5000/${user}/upload`, {
        method: "POST",
        body: formData,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload files.");
      }

      const data = await response.json();
      console.log("Server Response:", data);
      setUploadStatus({
        show: true,
        message: "Files uploaded successfully!",
        isError: false,
      });
      setFiles([]);
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadStatus({
        show: true,
        message: "Failed to upload files. Please try again.",
        isError: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMemory = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all memory? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setDeleteStatus({ show: false, message: "", isError: false });

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/${user}/delete_memory`,
        {
          method: "DELETE",
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete memory");
      }

      setDeleteStatus({
        show: true,
        message: "Memory deleted successfully!",
        isError: false,
      });

      // Clear the chat history as well
      setChat([]);
      // Clear the files list
      setFiles([]);
    } catch (error) {
      console.error("Error deleting memory:", error);
      setDeleteStatus({
        show: true,
        message: "Failed to delete memory. Please try again.",
        isError: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuerySubmit = async () => {
    if (query.trim() === "") return;

    setChat((prev) => [...prev, { type: "question", content: query }]);
    setIsTyping(true); // Start typing animation

    try {
      const response = await fetch(`http://127.0.0.1:5000/${user}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch query response.");
      }

      const data = await response.json();
      setChat((prev) => [...prev, { type: "answer", content: data.answer }]);
    } catch (error) {
      console.error("Error fetching query response:", error);
      setChat((prev) => [
        ...prev,
        { type: "answer", content: "Error fetching response from server." },
      ]);
    } finally {
      setIsTyping(false); // Stop typing animation
    }

    setQuery("");
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-md py-4">
        <div className="container mx-auto flex items-center justify-between px-6">
          <div className="flex items-center">
            <button onClick={() => navigate('/home')}>
              <img src={universeLogo} alt="UniVerse Logo" className="h-10" />
            </button>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 grid grid-cols-12 gap-6">
        
        {/* Sidebar */}
        <aside className="col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
  <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
  <input
    type="file"
    accept=".pdf,.ppt,.pptx"
    multiple
    onChange={handleFileUpload}
    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600"
  />
  <h3 className="text-sm font-medium mt-6 text-gray-800 dark:text-gray-200">Uploaded Files</h3>
  <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400">
    {files.map((file, index) => (
      <li key={index} className="mt-1 truncate">{file.name}</li>
    ))}
  </ul>
  
  <button
    onClick={sendFilesToServer}
    disabled={isUploading}
    className={`mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
  >
    {isUploading ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span>Uploading...</span>
      </>
    ) : (
      <span>Upload to Server</span>
    )}
  </button>

  {uploadStatus.show && (
    <div className={`mt-4 p-3 rounded-lg ${
      uploadStatus.isError 
        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }`}>
      {uploadStatus.message}
    </div>
  )}

  <div className="mt-6 border-t pt-4">
    <button
      onClick={handleDeleteMemory}
      disabled={isDeleting}
      className={`w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
    >
      {isDeleting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span>Deleting...</span>
        </>
      ) : (
        <span>Delete All Memory</span>
      )}
    </button>

    {deleteStatus.show && (
      <div className={`mt-4 p-3 rounded-lg ${
        deleteStatus.isError 
          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      }`}>
        {deleteStatus.message}
      </div>
    )}
  </div>
</aside>

        {/* Chat Section */}
        <section className="col-span-9 bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Chat
          </h3>
          <div className="flex-grow overflow-y-auto space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            {chat.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "question"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-md p-3 rounded-lg ${
                    message.type === "question"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-md p-3 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                  Typing<span className="animate-pulse">...</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer Query Input */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md py-4">
        <div className="container mx-auto flex items-center px-6 space-x-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question here..."
            className="flex-grow border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-300 dark:focus:ring-blue-600 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          />
          <button
            onClick={handleQuerySubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
};

export default RAGInterface;
