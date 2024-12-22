import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import ForgotPasswordForm from './auth/ForgotPasswordForm';
import { validateForm } from '../utils/formValidation';
import { fadeIn } from '../utils/animations';

const UnifiedAuthPage = () => {
  const [currentForm, setCurrentForm] = useState('login');
  const [resetStep, setResetStep] = useState('verify');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    usn: '',
    isAlumni: false,
    profileImage: null,
    profileImagePreview: null,
  });
  const [verificationError, setVerificationError] = useState('');
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || false
  );
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        // Create preview URL for image
        const previewUrl = URL.createObjectURL(file);
        setFormData({
          ...formData,
          profileImage: file,
          profileImagePreview: previewUrl
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVerificationError('');
  
    const validationError = validateForm(currentForm, formData);
    if (validationError) {
      alert(validationError);
      return;
    }
  
    let url = '';
    if (currentForm === 'login') {
      url = 'http://127.0.0.1:5000/login';
    } else if (currentForm === 'register') {
      url = 'http://127.0.0.1:5000/register';
    } else if (currentForm === 'forgotPassword') {
      url = 'http://127.0.0.1:5000/forgot_password';
    }
  
    try {
      let response;
      
      if (currentForm === 'login') {
        // For login, send JSON data
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });
      } else {
        // For register and forgot password, send FormData
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
          if (key === 'profileImage' && formData[key]) {
            submitData.append('profileImage', formData[key]);
          } else if (key !== 'profileImagePreview') {
            submitData.append(key, formData[key]);
          }
        });
  
        response = await fetch(url, {
          method: 'POST',
          body: submitData,
        });
      }
  
      const result = await response.json();
  
      if (response.ok) {
        console.log(result.message || `${currentForm} Successful`);
  
        if (formData.isAlumni) {
          localStorage.setItem('currentUsername', formData.username);
          localStorage.setItem('currentEmail', formData.email);
          localStorage.setItem('currentName', formData.name);
          localStorage.setItem('currentPassword', formData.password);
          localStorage.setItem('currentIsAlumni', formData.isAlumni);
          navigate('/alumni-linkedin');
        } else if (currentForm === 'login') {
          localStorage.setItem('currentUsername', formData.username);
          navigate('/home');
        } else if (currentForm === 'register') {
          navigate('/');
        } else if (currentForm === 'forgotPassword') {
          navigate('/home');
        }
      } else {
        const errorMessage = result.error || result.message || 'Something went wrong';
        console.error(errorMessage);
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An unexpected error occurred. Please try again later.');
    }
  };

  const switchForm = (formType) => {
    setCurrentForm(formType);
    setResetStep('verify');
    setVerificationError('');
    // Clear preview URL when switching forms
    if (formData.profileImagePreview) {
      URL.revokeObjectURL(formData.profileImagePreview);
    }
    setFormData(prev => ({
      ...prev,
      profileImage: null,
      profileImagePreview: null
    }));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
  };

  return (
    <div 
      className={`min-h-screen flex items-center justify-center transition-all duration-500 
        ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-500 to-purple-600 text-gray-900'}`}
    >
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 text-xl text-white bg-black/40 p-2 rounded-full transition-colors hover:bg-gray-600 focus:outline-none"
      >
        {darkMode ? '🌙' : '🌞'}
      </button>
      <motion.div 
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <img
          src="./src/assets/UniVerse.png"
          alt="Login Image"
          className="w-64 h-32 mx-auto mb-4 rounded-2xl border-2 border-white/10"
        />
        <div className={`rounded-2xl shadow-2xl p-8 border ${darkMode ? 'bg-gray-800 border-white/20' : 'bg-white/10 backdrop-blur-lg border-white/10'}`}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-white'}`}>
              {currentForm === 'login' && 'Welcome Back'}
              {currentForm === 'register' && 'Create Account'}
              {currentForm === 'forgotPassword' && (resetStep === 'verify' ? 'Account Recovery' : 'Reset Password')}
            </h2>
            <p className={`text-white/80 ${darkMode ? 'text-white/80' : 'text-white/80'}`}>
              {currentForm === 'login' && 'Sign in to continue'}
              {currentForm === 'register' && 'Join our community'}
              {currentForm === 'forgotPassword' && "We'll help you reset your password"}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentForm === 'login' && (
              <LoginForm 
                formData={formData} 
                handleChange={handleChange} 
              />
            )}

            {currentForm === 'register' && (
              <>
                <RegisterForm 
                  formData={formData} 
                  handleChange={handleChange} 
                />
                <div className="space-y-2">
                  <label className="block text-white text-sm font-medium">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    {formData.profileImagePreview && (
                      <img
                        src={formData.profileImagePreview}
                        alt="Profile Preview"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <input
                      type="file"
                      name="profileImage"
                      accept="image/*"
                      onChange={handleChange}
                      className="block w-full text-sm text-white/80
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-white/10 file:text-white
                        hover:file:bg-white/20
                        cursor-pointer"
                    />
                  </div>
                </div>
              </>
            )}

            {currentForm === 'forgotPassword' && (
              <ForgotPasswordForm 
                formData={formData} 
                handleChange={handleChange} 
                resetStep={resetStep}
                verificationError={verificationError}
              />
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className={`w-full py-3 px-4 rounded-lg font-semibold shadow-lg 
                transition-all duration-300 ${darkMode ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
            >
              {currentForm === 'login' && 'Sign In'}
              {currentForm === 'register' && 'Create Account'}
              {currentForm === 'forgotPassword' && (resetStep === 'verify' ? 'Verify Account' : 'Reset Password')}
            </motion.button>
          </form>

          <div className="mt-8 text-center space-y-2">
            {currentForm === 'login' && (
              <>
                <p className={`text-white/80 ${darkMode ? 'text-white/80' : 'text-white/80'}`}>
                  New here?{' '}
                  <button
                    onClick={() => switchForm('register')}
                    className={`font-semibold transition-colors ${darkMode ? 'text-white' : 'text-blue-200'}`}
                  >
                    Create an account
                  </button>
                </p>
                <p className={`text-white/80 ${darkMode ? 'text-white/80' : 'text-white/80'}`}>
                  <button
                    onClick={() => switchForm('forgotPassword')}
                    className={`font-semibold transition-colors ${darkMode ? 'text-white' : 'text-blue-200'}`}
                  >
                    Forgot your password?
                  </button>
                </p>
              </>
            )}

            {(currentForm === 'register' || currentForm === 'forgotPassword') && (
              <p className={`text-white/80 ${darkMode ? 'text-white/80' : 'text-white/80'}`}>
                Already have an account?{' '}
                <button
                  onClick={() => switchForm('login')}
                  className={`font-semibold transition-colors ${darkMode ? 'text-white' : 'text-blue-200'}`}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UnifiedAuthPage;