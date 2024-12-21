// Import necessary libraries
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import pages and components
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import EducationPage from './components/EducationPage';
import SocialsPage from './components/SocialsPage';
import CollegeLifePage from './components/CollegeLifePage';
import ClubInteractionSpaces from './components/ClubInteractionSpaces'; // Added ClubInteractionSpaces
import UnifiedAuthPage from './components/UnifiedAuthPage';
import RAGInterface from './components/education/SmartNotes';
import QuizRoom from './components/education/Quiz/quizHome';
import QuizGame from './components/education/Quiz/quizGame.jsx';
import Hangouts from './components/socials/Hangouts';
import Events from './components/socials/Events';
import AddHangouts from './components/socials/hangouts/AddHangouts';
import Notes from './components/education/Assignments';
import Activities from './components/socials/hangouts/Activities';
import Restaurants from './components/socials/hangouts/Restaurants.jsx';
import Nature from './components/socials/hangouts/Nature.jsx';
import GamingComms from './components/GamingComms.jsx';
// Import styles
import './index.css';

// Render application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Authentication and Main Navigation */}
        <Route path="/" element={<UnifiedAuthPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Education Routes */}
        <Route path="/education" element={<EducationPage />} />
        <Route path="/education/smart-notes" element={<RAGInterface />} />
        <Route path="/education/quiz" element={<QuizRoom />} />
        <Route path="/education/notes" element={<Notes />} />
        <Route path="/education/quizGame" element={<QuizGame/>} />

        {/* Socials Routes */}
        <Route path="/socials" element={<SocialsPage />} />
        <Route path="/socials/hangouts" element={<Hangouts />} />
        <Route path="/socials/events" element={<Events />} />
        <Route path="/socials/hangouts/add" element={<AddHangouts />} />
        <Route path="/socials/hangouts/activities" element={<Activities />} />
        <Route path="/socials/hangouts/foodies" element={<Restaurants />} />
        <Route path="/socials/hangouts/nature" element={<Nature />} />

        {/* College Life Routes */}
        <Route path="/college-life" element={<CollegeLifePage />} />
        <Route path="/club-interaction-spaces" element={<ClubInteractionSpaces />} />
        <Route path="/gaming-communities" element={<GamingComms />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
