import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Import Router and Routes
import UnifiedAuthPage from './components/UnifiedAuthPage';
import HomePage from './components/HomePage';  // Import HomePage
import './App.css';

function App() {
  return (
    <Router>  {/* Wrap the application in Router */}
      <div className="App">
        <Routes>
          <Route path="/" element={<UnifiedAuthPage />} />  {/* Main Auth page */}
          <Route path="/home" element={<HomePage />} />     {/* Home page after successful login */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
