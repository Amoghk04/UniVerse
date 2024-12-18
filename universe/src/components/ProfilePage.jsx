import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);

  const username = localStorage.getItem('currentUsername'); // Retrieve username

  useEffect(() => {
    if (!username) {
      navigate('/'); // Redirect to login if no username is found
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/user/${username}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }
        const data = await response.json();
        setUserDetails(data.user);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [username, navigate]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('currentUsername'); // Clear stored username
    navigate('/'); // Redirect to login page
  };

  if (!userDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-900 dark:text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center">
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 w-full flex items-center justify-between px-4">
        <button 
          onClick={() => navigate('/home')} 
          className="px-3 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
        >
          Back
        </button>
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="w-12"></div> {/* Empty space to balance alignment */}
      </header>
      <main className="container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full max-w-md">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-700 mb-6 flex items-center justify-center">
              <span className="text-xl text-gray-500">Add Photo</span>
            </div>
            <h2 className="text-xl font-bold mb-4">User Information</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-center">Name: <span className="font-medium">{userDetails.name}</span></p>
            <p className="text-sm text-center">USN: <span className="font-medium">{userDetails.usn}</span></p>
            <p className="text-sm text-center">Username: <span className="font-medium">{userDetails.username}</span></p>
            <p className="text-sm text-center">Email: <span className="font-medium">{userDetails.email}</span></p>
          </div>
        </div>
        <button 
          onClick={handleLogout} // Attach the logout handler
          className="mt-8 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-lg font-semibold shadow-lg hover:from-blue-600 hover:to-purple-700 transition"
        >
          Logout
        </button>
      </main>
    </div>
  );
};

export default ProfilePage;
