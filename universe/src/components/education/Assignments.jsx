import React, { useState } from "react";
import { motion } from "framer-motion";
import { SunIcon, MoonIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [hierarchy, setHierarchy] = useState({});
  const [newEntry, setNewEntry] = useState({
    semester: "",
    branch: "",
    subject: "",
    file: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSemesters, setExpandedSemesters] = useState({});
  const [expandedBranches, setExpandedBranches] = useState({});
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const navigate = useNavigate();
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  const handleAddEntry = () => {
    const { semester, branch, subject, file } = newEntry;

    setHierarchy((prev) => {
      const updatedHierarchy = { ...prev };

      if (!updatedHierarchy[semester]) {
        updatedHierarchy[semester] = {};
      }

      if (!updatedHierarchy[semester][branch]) {
        updatedHierarchy[semester][branch] = {};
      }

      if (!updatedHierarchy[semester][branch][subject]) {
        updatedHierarchy[semester][branch][subject] = [];
      }

      updatedHierarchy[semester][branch][subject].push(file);

      return updatedHierarchy;
    });

    setNewEntry({ semester: "", branch: "", subject: "", file: "" });
    setShowPopup(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const filteredFiles = () => {
    const results = [];

    if (!searchQuery) return results;

    for (const semester in hierarchy) {
      for (const branch in hierarchy[semester]) {
        for (const subject in hierarchy[semester][branch]) {
          hierarchy[semester][branch][subject].forEach((file) => {
            if (file.toLowerCase().includes(searchQuery)) {
              results.push({ semester, branch, subject, file });
            }
          });
        }
      }
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
                          <li key={index} className="text-gray-600 dark:text-gray-400">
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
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? "dark bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-md py-4">
        <div className="container mx-auto flex items-center justify-between px-6">
          {/* Left: Title */}
          <h1 className="text-xl font-bold">File Manager</h1>

          {/* Center: Image */}
          <div className="flex-grow flex justify-center">
          <motion.button
          onClick={() => navigate("/home")}>
            <img
              src="/src/assets/UniVerse.png" // Replace with the URL of your desired image
              alt="Header Logo"
              className="h-10 w-10 object-cover rounded-full"
            />
          </motion.button>
          </div>

          {/* Right: Dark Mode Toggle */}
          <motion.button
            onClick={toggleDarkMode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <SunIcon className="text-yellow-500" /> : <MoonIcon className="text-blue-600" />}
          </motion.button>
        </div>
      </header>


      {/* Main Content */}
      <div className="flex flex-col md:flex-row container mx-auto px-6 py-8 gap-6">
        {/* Sidebar */}
        <aside className="md:w-1/4 bg-white dark:bg-gray-800 rounded-lg shadow p-4 overflow-y-auto max-h-[80vh]">
          <button
            onClick={() => setShowPopup(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add File +
          </button>
          <h3 className="text-lg font-semibold mt-6 text-gray-800 dark:text-gray-200">File Structure</h3>
          <div className="mt-4">{renderHierarchy(hierarchy)}</div>
        </aside>

        {/* Main Section */}
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
                    onClick={() => alert(`Clicked on: ${file} (${semester} > ${branch} > ${subject})`)}
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

      {/* Popup for Adding Files */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Add File</h2>
            {["semester", "branch", "subject", "file"].map((field, index) => (
              <div className="mb-4" key={index}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{field}</label>
                <input
                  type="text"
                  value={newEntry[field]}
                  onChange={(e) => setNewEntry({ ...newEntry, [field]: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
            ))}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

export default App;
