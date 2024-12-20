export const validateForm = (formType, formData) => {
    const { username, email, password, confirmPassword } = formData;
  
    if (formType === 'register' || (formType === 'forgotPassword' && password)) {
      if (password !== confirmPassword) {
        return 'Passwords do not match';
      }
      
      if (password.length < 8) {
        return 'Password must be at least 8 characters long';
      }
    }
  
    if (formType === 'register') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
      }
  
      if (username.length < 3) {
        return 'Username must be at least 3 characters long';
      }
    }
  
    return null;
  };