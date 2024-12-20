import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/activities');
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (placeName) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/reviews/${placeName}`);
      setReviews(response.data);
      setSelectedPlace(placeName);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlace(null);
    setReviews([]);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Activities</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <div
            key={activity._id}
            onClick={() => fetchReviews(activity.name)}
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            <img
              src={`data:image/jpeg;base64,${activity.image}`}
              alt={activity.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-bold">{activity.name}</h2>
              <p className="text-sm text-gray-400">
                Average Rating: {activity.avg_rating}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white text-black rounded-lg p-6 w-3/4 max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Reviews for {selectedPlace}</h2>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded"
            >
              Close
            </button>
            {reviews.length > 0 ? (
              <ul className="space-y-4">
                {reviews.map((review) => (
                  <li
                    key={review._id}
                    className="border-b pb-2 last:border-b-0"
                  >
                    <p className="font-semibold">Rating: {review.rating}/5</p>
                    <p className="italic">{review.review}</p>
                    <p className="text-gray-500 text-sm">
                      By: {review.username || 'Anonymous'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reviews available for this place.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
