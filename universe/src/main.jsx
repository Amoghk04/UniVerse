import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import EducationPage from './components/EducationPage';
import SocialsPage from './components/SocialsPage';
import CollegeLifePage from './components/CollegeLifePage';
import AdvancedSearch from './components/AdvancedSearch';
import './index.css';
import UnifiedAuthPage from './components/UnifiedAuthPage';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<UnifiedAuthPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/socials" element={<SocialsPage />} />
        <Route path="/college-life" element={<CollegeLifePage />} />
        <Route path="/ai-academic-search" element={<AdvancedSearch />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
