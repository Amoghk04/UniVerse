import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FormInput from '../common/FormInput';
import { staggeredChildren } from '../../utils/animations';

const RegisterForm = ({ formData, handleChange }) => {
  const [passwordVisible, setPasswordVisible] = useState(false); // State to toggle password visibility
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // State to toggle confirm password visibility

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Function to toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  return (
    <motion.div
      variants={staggeredChildren}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <FormInput
        label="Name"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <FormInput
        label="Username"
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
      />
      <FormInput
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <FormInput
        label="USN"
        type="text"
        name="usn"
        value={formData.usn}
        onChange={handleChange}
        required
      />
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="isAlumni"
          id="isAlumni"
          checked={formData.isAlumni}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="isAlumni" className="text-white">
          I am an alumni
        </label>
      </div>
      <div className="relative">
        <FormInput
          label="Password"
          type={passwordVisible ? 'text' : 'password'} // Toggle type based on visibility
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {/* Toggle visibility button */}
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute top-1/2 right-3 transform -translate-y-1/5 text-gray-500"
        >
          {passwordVisible ? 'Hide' : 'Show'}
        </button>
      </div>
      <div className="relative">
        <FormInput
          label="Confirm Password"
          type={confirmPasswordVisible ? 'text' : 'password'} // Toggle type based on visibility
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        {/* Toggle visibility button */}
        <button
          type="button"
          onClick={toggleConfirmPasswordVisibility}
          className="absolute top-1/2 right-3 transform -translate-y-1/5 text-gray-500"
        >
          {confirmPasswordVisible ? 'Hide' : 'Show'}
        </button>
      </div>
    </motion.div>
  );
};

export default RegisterForm;
