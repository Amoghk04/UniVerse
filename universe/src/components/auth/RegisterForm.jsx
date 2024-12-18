import React from 'react';
import { motion } from 'framer-motion';
import FormInput from '../common/FormInput';
import { staggeredChildren } from '../../utils/animations';

const RegisterForm = ({ formData, handleChange }) => {
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
      <FormInput
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <FormInput
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
      />
    </motion.div>
  );
};

export default RegisterForm;