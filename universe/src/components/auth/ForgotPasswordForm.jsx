import React from 'react';
import { motion } from 'framer-motion';
import FormInput from '../common/FormInput';
import { staggeredChildren } from '../../utils/animations';

const ForgotPasswordForm = ({ formData, handleChange, verificationError }) => {
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
        label="New Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <FormInput
        label="Confirm New Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
      />
    </motion.div>
  );
};


export default ForgotPasswordForm;