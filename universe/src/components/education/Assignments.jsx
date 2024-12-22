import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Notes = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || false
  );
  const [showPopup, setShowPopup] = useState(false);
  const [hierarchy, setHierarchy] = useState({});
  const [newEntry, setNewEntry] = useState({
    semester: "",
    branch: "",
    subject: "",
    file: null,
    username: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSemesters, setExpandedSemesters] = useState({});
  const [expandedBranches, setExpandedBranches] = useState({});
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const navigate = useNavigate();
  const username = localStorage.getItem("currentUsername");
  const url = "http://127.0.0.1:5000"

  useEffect(() => {
    // Fetch the hierarchy of files from the backend
    axios
      .get(`${url}/notes/upload`)
      .then((response) => {
        setHierarchy(response.data || {});
      })
      .catch((error) => {
        console.error("Error fetching files:", error);
        setHierarchy({});
      });
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  const handleAddEntry = async () => {
    try {
      // Validate required fields
      if (!newEntry.semester || !newEntry.branch || !newEntry.subject || !newEntry.file) {
        alert('Please fill in all fields');
        return;
      }

      const formData = new FormData();
      formData.append("semester", newEntry.semester);
      formData.append("branch", newEntry.branch);
      formData.append("subject", newEntry.subject);
      formData.append("file", newEntry.file);
      formData.append("username", username);

      // Upload the file to the backend
      const response = await axios.post(`${url}/notes/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update the hierarchy with the new data
      const updatedHierarchy = { ...hierarchy };
      
      // Create nested structure if it doesn't exist
      if (!updatedHierarchy[newEntry.semester]) {
        updatedHierarchy[newEntry.semester] = {};
      }
      if (!updatedHierarchy[newEntry.semester][newEntry.branch]) {
        updatedHierarchy[newEntry.semester][newEntry.branch] = {};
      }
      if (!updatedHierarchy[newEntry.semester][newEntry.branch][newEntry.subject]) {
        updatedHierarchy[newEntry.semester][newEntry.branch][newEntry.subject] = [];
      }

      // Add the new file to the hierarchy
      updatedHierarchy[newEntry.semester][newEntry.branch][newEntry.subject].push(
        newEntry.file.name
      );

      // Update state
      setHierarchy(updatedHierarchy);
      
      // Reset form and close popup
      setNewEntry({ semester: "", branch: "", subject: "", file: null });
      setShowPopup(false);

      // Automatically expand the newly added sections
      setExpandedSemesters(prev => ({
        ...prev,
        [newEntry.semester]: true
      }));
      setExpandedBranches(prev => ({
        ...prev,
        [`${newEntry.semester}-${newEntry.branch}`]: true
      }));
      setExpandedSubjects(prev => ({
        ...prev,
        [`${newEntry.semester}-${newEntry.branch}-${newEntry.subject}`]: true
      }));

    } catch (error) {
      console.error("Error uploading file:", error);
      alert('Error uploading file. Please try again.');
    }
  };

  const handleFileDownload = async (filename) => {
    try {
      const response = await axios.get(`${url}/notes/download/${filename}`, {
        responseType: 'blob'
      });
      
      // Create a URL for the blob
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const filteredFiles = () => {
    const results = [];
  
    if (!searchQuery || !hierarchy) return results;
  
    try {
      Object.entries(hierarchy).forEach(([semester, branches]) => {
        if (!branches) return;
        
        Object.entries(branches).forEach(([branch, subjects]) => {
          if (!subjects) return;
          
          Object.entries(subjects).forEach(([subject, files]) => {
            if (!Array.isArray(files)) return;
            
            files.forEach((file) => {
              if (
                file.toLowerCase().includes(searchQuery) ||
                semester.toLowerCase().includes(searchQuery) ||
                branch.toLowerCase().includes(searchQuery) ||
                subject.toLowerCase().includes(searchQuery)
              ) {
                results.push({ semester, branch, subject, file });
              }
            });
          });
        });
      });
    } catch (error) {
      console.error("Error filtering files:", error);
    }
  
    return results;
  };

  const toggleSemester = (semester) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [semester]: !prev[semester],
    }));
  };

  const toggleBranch = (semester, branch) => {
    setExpandedBranches((prev) => ({
      ...prev,
      [`${semester}-${branch}`]: !prev[`${semester}-${branch}`],
    }));
  };

  const toggleSubject = (semester, branch, subject) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [`${semester}-${branch}-${subject}`]: !prev[`${semester}-${branch}-${subject}`],
    }));
  };

  const renderHierarchy = (hierarchy) => {
    return Object.keys(hierarchy).map((semester) => (
      <div key={semester}>
        <h3
          onClick={() => toggleSemester(semester)}
          className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-4 cursor-pointer"
        >
          {semester}
        </h3>
        {expandedSemesters[semester] &&
          Object.keys(hierarchy[semester]).map((branch) => (
            <div key={branch} className="ml-4">
              <h4
                onClick={() => toggleBranch(semester, branch)}
                className="text-md font-semibold text-gray-600 dark:text-gray-300 cursor-pointer"
              >
                {branch}
              </h4>
              {expandedBranches[`${semester}-${branch}`] &&
                Object.keys(hierarchy[semester][branch]).map((subject) => (
                  <div key={subject} className="ml-6">
                    <h5
                      onClick={() => toggleSubject(semester, branch, subject)}
                      className="text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer"
                    >
                      {subject}
                    </h5>
                    {expandedSubjects[`${semester}-${branch}-${subject}`] && (
                      <ul className="ml-8 list-disc">
                        {hierarchy[semester][branch][subject].map((file, index) => (
                          <li 
                            key={index} 
                            className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-500 dark:hover:text-blue-400"
                            onClick={() => handleFileDownload(file)}
                          >
                            {file}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          ))}
      </div>
    ));
  };

  const searchResults = filteredFiles();

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode ? "dark bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-md py-4">
        <div className="container mx-auto flex items-center justify-between px-6">
          <h1 className="text-xl font-bold">File Manager</h1>
          <div className="flex-grow flex justify-center">
            <motion.button onClick={() => navigate("/home")}>
              <img
                src="/src/assets/UniVerse.png"
                alt="Header Logo"
                className="h-10 w-10 object-cover rounded-full"
              />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row container mx-auto px-6 py-8 gap-6">
        <aside className="md:w-1/4 bg-white dark:bg-gray-800 rounded-lg shadow p-4 overflow-y-auto max-h-[80vh]">
          <button
            onClick={() => setShowPopup(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add File + <br></br> (Max 16MB)
          </button>
          <h3 className="text-lg font-semibold mt-6 text-gray-800 dark:text-gray-200">Semesters</h3>
          <div className="mt-4">{renderHierarchy(hierarchy)}</div>
        </aside>

        <main className="flex-grow bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <input
            type="text"
            placeholder="Search Files"
            className="w-full mb-6 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className="text-gray-800 dark:text-gray-200">
            <h2 className="text-xl font-bold mb-4">Search Results</h2>
            {searchResults.length === 0 ? (
              <p>No files found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map(({ semester, branch, subject, file }, index) => (
                  <motion.div
                    key={index}
                    className="p-4 bg-blue-100 dark:bg-blue-700 rounded-lg shadow cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFileDownload(file)}
                  >
                    <p className="font-semibold">{file}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{`${semester} > ${branch} > ${subject}`}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Add File</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Semester</label>
              <input
                type="text"
                value={newEntry.semester}
                onChange={(e) => setNewEntry({ ...newEntry, semester: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
              <input
                type="text"
                value={newEntry.branch}
                onChange={(e) => setNewEntry({ ...newEntry, branch: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
              <input
                type="text"
                value={newEntry.subject}
                onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">File</label>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNewEntry({ ...newEntry, file: file });
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700"
                accept=".pdf,.doc,.docx,.txt"  // Add accepted file types
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
