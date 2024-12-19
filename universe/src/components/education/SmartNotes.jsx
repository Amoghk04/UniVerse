import React, { useState } from "react";
import universeLogo from "/src/assets/UniVerse.png"; // Replace with your logo

const RAGInterface = () => {
  const [files, setFiles] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [query, setQuery] = useState("");

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles([...files, ...uploadedFiles]);
  };

  const handleQuerySubmit = () => {
    if (query.trim() === "") return;

    // Simulate question-answer generation (replace this with backend API call)
    setQuestions((prev) => [...prev, query]);
    setAnswers((prev) => [...prev, "This is a generated answer for your query."]);

    setQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto flex items-center justify-between px-6">
          <div className="flex items-center">
            <img src={universeLogo} alt="UniVerse Logo" className="h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-700">UniVerse</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-3 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
          <input
            type="file"
            accept=".pdf,.ppt,.pptx"
            multiple
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
          <h3 className="text-sm font-medium mt-6">Uploaded Files</h3>
          <ul className="mt-2 text-sm text-gray-600">
            {files.map((file, index) => (
              <li key={index} className="mt-1 truncate">
                {file.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Interaction Section */}
        <section className="col-span-9 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Questions</h3>
              <ul className="space-y-2">
                {questions.map((question, index) => (
                  <li
                    key={index}
                    className="p-3 bg-gray-100 rounded shadow-sm text-sm text-gray-700"
                  >
                    {question}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Answers</h3>
              <ul className="space-y-2">
                {answers.map((answer, index) => (
                  <li
                    key={index}
                    className="p-3 bg-gray-100 rounded shadow-sm text-sm text-gray-700"
                  >
                    {answer}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Query Input */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-md py-4">
        <div className="container mx-auto flex items-center px-6 space-x-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question here..."
            className="flex-grow border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-300"
          />
          <button
            onClick={handleQuerySubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ask
          </button>
        </div>
      </footer>
    </div>
  );
};

export default RAGInterface;
