import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FormInput from '../../common/FormInput'; // Ensure this path is correct
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddHangouts = () => {
  const [formData, setFormData] = useState({
    placeName: '',
    image: '',
    category: '',
    review: '',
    rating: '',
    username: localStorage.getItem('currentUsername'),
  });
  const [placeExists, setPlaceExists] = useState(null); // true, false, or null
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const url= "http://127.0.0.1:5000";
  const staggeredChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const checkPlaceExists = async () => {
    setLoading(true);
    try {
      
      const response = await axios.get(`${url}/place?place_name=${formData.placeName.toLowerCase()}`);
      
      if (response.data && response.data.exists !== undefined) {
        setPlaceExists(response.data.exists);
        console.log('Place exists:', response.data.exists); // For debugging
      } else {
        console.log('Invalid response structure:', response);
      }
    } catch (error) {
      console.error('Error checking place:', error);
    }
    setLoading(false);
  };
  

  const handleSubmit = async (e) => {
    if (placeExists) {
      // Submit review if place exists
      await axios.post(`${url}/add_review`, {
        placename: formData.placeName,
        review: formData.review,
        rating: formData.rating,
        username: formData.username
      });
    } else {
      // Submit new place if place doesn't exist
      await axios.post(`${url}/add_place`, {
        placename: formData.placeName,
        image: formData.image,
        category: formData.category
      });
      // Then submit review
      await axios.post(`${url}/add_review`, {
        placename: formData.placeName,
        review: formData.review,
        rating: formData.rating,
        username: formData.username
      });
    }
    navigate(`/socials/hangouts`);
  };

  return (
    <div className='"dark bg-gray-900 text-white"'>
    <motion.div
      variants={staggeredChildren}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl mx-auto p-6 bg-gray-800 text-white rounded-xl shadow-lg"
    >
      <h2 className="text-3xl font-semibold text-center mb-6">Add New Hangout</h2>

      <FormInput
        label="Place Name"
        type="text"
        name="placeName"
        value={formData.placeName}
        onChange={handleChange}
        required
        className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
      />
      
      <button
        type="button"
        onClick={checkPlaceExists}
        className="w-full py-3 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        disabled={loading}
      >
        {loading ? 'Checking...' : 'Check Place'}
      </button>

      {/* Conditional Rendering */}
      {placeExists === true && (
        <div className="space-y-4 mt-6">
          <FormInput
            label="Review"
            type="text"
            name="review"
            value={formData.review}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
          
          <FormInput
            label="Rating"
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            required
            min={1}
            max={5}
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {placeExists === false && (
        <div className="space-y-4 mt-6">
          <FormInput
            label="Image URL"
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="space-y-2">
            <label htmlFor="category" className="text-white">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              <option value="food">food</option>
              <option value="nature">nature</option>
              <option value="activities">activities</option>
            </select>
          </div>

          <FormInput
            label="Review"
            type="text"
            name="review"
            value={formData.review}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
          
          <FormInput
            label="Rating"
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            required
            min={1}
            max={5}
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {placeExists !== null && (
        <button
          type="button"
          onClick={() => {
            handleSubmit();
          }}
          className="w-full py-3 mt-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
        >
          {placeExists ? 'Add Review' : 'Add Place and Review'}
        </button>
      )}
    </motion.div>
    </div>
  );
};

export default AddHangouts;