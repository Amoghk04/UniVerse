import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FormInput from '../common/FormInput';
import { staggeredChildren } from '../../utils/animations';

const LoginForm = ({ formData, handleChange }) => {
  const [passwordVisible, setPasswordVisible] = useState(false); // State to toggle password visibility

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <motion.div
      variants={staggeredChildren}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <FormInput
        label="Username"
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
      />
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
    </motion.div>
  );
};

export default LoginForm;
