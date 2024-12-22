import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronLeft, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem('currentUsername');

  useEffect(() => {
    if (!username) {
      navigate('/home');
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
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [username, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUsername');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const InfoRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-200 dark:border-gray-700">
      <span className="text-sm text-gray-500 dark:text-gray-400 sm:w-1/3">{label}</span>
      <span className="font-medium mt-1 sm:mt-0">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/home')} 
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 transition"
          >
            <LogOut size={20} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
              <div className="relative">
                {userDetails?.profileImage ? (
                  <img 
                    src={`data:image/jpeg;base64,${userDetails.profileImage}`}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Camera size={32} className="text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 px-6 pb-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {userDetails.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {userDetails.isAlumni ? 'Alumni' : 'Student'}
              </p>
            </div>

            <div className="space-y-1">
              <InfoRow label="Username" value={userDetails.username} />
              <InfoRow label="USN" value={userDetails.usn} />
              <InfoRow label="Email" value={userDetails.email} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;