import React, { useState, useEffect, useRef } from 'react';
import { SendIcon, LinkIcon, UsersIcon, UploadIcon } from 'lucide-react';

const GamingComms = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userList, setUserList] = useState(['User1', 'User2', 'User3']);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleAuthentication = () => {
    if (currentUser.trim()) {
      setIsAuthenticated(true);
      if (!userList.includes(currentUser)) {
        setUserList((prev) => [...prev, currentUser]);
      }
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: currentUser,
      timestamp: new Date().toLocaleTimeString(),
      type: 'text',
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const message = {
        id: Date.now(),
        text: file.name,
        sender: currentUser,
        timestamp: new Date().toLocaleTimeString(),
        type: 'file',
        fileUrl: URL.createObjectURL(file),
      };
      setMessages((prev) => [...prev, message]);
    }
  };

  const handleSendLink = () => {
    const link = prompt('Enter the link to share:');
    if (link) {
      const message = {
        id: Date.now(),
        text: link,
        sender: currentUser,
        timestamp: new Date().toLocaleTimeString(),
        type: 'link',
      };
      setMessages((prev) => [...prev, message]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      {!isAuthenticated ? (
        <div className="flex items-center justify-center h-screen">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-96">
            <h2 className="text-xl font-bold mb-4 text-center">Join Gaming Communities</h2>
            <input
              type="text"
              placeholder="Enter your username"
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 mb-4"
            />
            <button
              onClick={handleAuthentication}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Join Chat
            </button>
          </div>
        </div>
      ) : (
        <>
          <header className="bg-blue-500 dark:bg-gray-800 p-4 text-white flex justify-between items-center">
            <h1 className="text-xl font-bold">Gaming Communities</h1>
            <button
              onClick={() => window.history.back()}
              className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Back
            </button>
          </header>

          <main className="flex flex-grow">
            {/* User List */}
            <aside className="w-1/4 bg-white dark:bg-gray-800 border-r p-4 space-y-2">
              <h2 className="text-lg font-bold">Active Users</h2>
              <ul className="space-y-1">
                {userList.map((user, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <UsersIcon size={16} />
                    <span>{user}</span>
                  </li>
                ))}
              </ul>
            </aside>

            {/* Chat Area */}
            <section className="flex-1 p-4 flex flex-col">
              <div className="flex-1 overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === currentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg mb-2 ${
                        msg.sender === currentUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 dark:bg-gray-700 text-gray-900'
                      }`}
                    >
                      <span className="block text-sm font-semibold">{msg.sender}</span>
                      {msg.type === 'text' && <span className="block">{msg.text}</span>}
                      {msg.type === 'file' && (
                        <a
                          href={msg.fileUrl}
                          download={msg.text}
                          className="text-sm text-blue-700 underline"
                        >
                          {msg.text}
                        </a>
                      )}
                      {msg.type === 'link' && (
                        <a
                          href={msg.text}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-700 underline"
                        >
                          {msg.text}
                        </a>
                      )}
                      <span className="block text-xs text-gray-500 mt-1">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef}></div>
              </div>

              {/* Message Input */}
              <div className="flex items-center space-x-2 border-t p-4">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 p-2 border rounded dark:bg-gray-700"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <UploadIcon size={20} />
                </button>
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <SendIcon size={20} />
                </button>
                <button
                  onClick={handleSendLink}
                  className="p-2 bg-gray-300 dark:bg-gray-700 text-gray-900 rounded hover:bg-gray-400"
                >
                  <LinkIcon size={20} />
                </button>
              </div>
            </section>
          </main>
        </>
      )}
    </div>
  );
};

export default GamingComms;
