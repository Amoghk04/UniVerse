import React from 'react';
import { motion } from 'framer-motion';
import FormInput from '../common/FormInput';
import { staggeredChildren } from '../../utils/animations';

const LoginForm = ({ formData, handleChange }) => {
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
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
      />
    </motion.div>
  );
};

export default LoginForm;