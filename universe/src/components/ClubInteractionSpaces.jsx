// Import necessary libraries
import React, { useState } from 'react';
import { PlusIcon, MessageCircleIcon, UploadIcon } from 'lucide-react';

const ClubInteractionSpaces = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubs] = useState(["CodeRIT", "IEEE CS", "S.T.A.R.D.U.ST"]);
  const [events, setEvents] = useState({});
  const [authModalVisible, setAuthModalVisible] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState({});

  const handleAddEvent = () => {
    const eventTitle = prompt("Enter Event Title:");
    const eventDescription = prompt("Enter Event Description:");
    const eventLink = prompt("Enter Event Link:");
    const eventPoster = prompt("Enter Event Poster URL:");

    if (!eventTitle || !eventDescription || !eventLink || !eventPoster) {
      alert("All fields are required to add an event.");
      return;
    }

    if (selectedClub) {
      setEvents((prev) => ({
        ...prev,
        [selectedClub]: [
          ...(prev[selectedClub] || []),
          { title: eventTitle, description: eventDescription, link: eventLink, poster: eventPoster },
        ],
      }));
    }
  };

  const handleAuth = (role) => {
    setIsAdmin(role === "admin");
    setAuthModalVisible(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [selectedClub]: [...(prev[selectedClub] || []), { text: newMessage, sender: isAdmin ? "Admin" : "Student" }],
    }));
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex">
      {/* Authentication Modal */}
      {authModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">Login as</h2>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => handleAuth("admin")}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Admin
              </button>
              <button
                onClick={() => handleAuth("student")}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar for Clubs */}
      <div className="w-1/4 bg-gray-200 dark:bg-gray-800 p-4 space-y-4 overflow-y-auto">
        <h3 className="text-lg font-bold">Clubs</h3>
        {clubs.map((club) => (
          <div
            key={club}
            className={`p-3 rounded cursor-pointer ${
              selectedClub === club
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
            onClick={() => setSelectedClub(club)}
          >
            {club}
          </div>
        ))}
        {isAdmin && (
          <button
            onClick={handleAddEvent}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded hover:from-green-600 hover:to-teal-700 flex items-center space-x-2"
          >
            <PlusIcon size={16} />
            <span>Add Event</span>
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 space-y-4">
        {selectedClub ? (
          <>
            <h2 className="text-2xl font-bold">{selectedClub}</h2>

            {/* Events Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Events</h3>
              {events[selectedClub]?.length > 0 ? (
                events[selectedClub].map((event, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800"
                  >
                    <h3 className="text-lg font-bold">{event.title}</h3>
                    <p>{event.description}</p>
                    {event.poster && <img src={event.poster} alt="Event Poster" className="w-full h-auto mt-2 rounded-lg" />}
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline mt-2 block"
                    >
                      Join Event
                    </a>
                  </div>
                ))
              ) : (
                <p>No events posted yet.</p>
              )}
            </div>

            {/* Chat Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Club Chat</h3>
              <div className="h-64 overflow-y-auto bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                {messages[selectedClub]?.length > 0 ? (
                  messages[selectedClub].map((msg, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded mb-2 ${
                        msg.sender === "Admin" ? "bg-blue-500 text-white" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <strong>{msg.sender}: </strong>
                      {msg.text}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No messages yet.</p>
                )}
              </div>
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800 dark:text-white"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded hover:from-blue-600 hover:to-purple-700"
                >
                  <MessageCircleIcon />
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-600">Select a club from the left to see its events and interact with members.</p>
        )}
      </div>
    </div>
  );
};

export default ClubInteractionSpaces;
