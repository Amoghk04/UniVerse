import React from 'react';
import { motion } from 'framer-motion';

const FormInput = ({ label, type, name, value, onChange, required }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1"
    >
      <label htmlFor={name} className="block text-sm font-medium text-white">
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg 
                   text-white placeholder-white/50 focus:outline-none focus:ring-2 
                   focus:ring-white focus:border-transparent transition-all duration-300"
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
    </motion.div>
  );
};

export default FormInput;