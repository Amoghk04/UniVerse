import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import EducationPage from './components/EducationPage';
import SocialsPage from './components/SocialsPage';
import CollegeLifePage from './components/CollegeLifePage';
import './index.css';
import UnifiedAuthPage from './components/UnifiedAuthPage';
import RAGInterface from './components/education/SmartNotes';
import QuizRoom from './components/education/Quiz/quizHome';
import Hangouts from './components/socials/Hangouts';
import Events from './components/socials/Events';
import AddHangouts from './components/socials/hangouts/AddHangouts';
import Notes from './components/education/Assignments.jsx';

import Activities from './components/socials/hangouts/Activities';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UnifiedAuthPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/socials" element={<SocialsPage />} />
        <Route path="/college-life" element={<CollegeLifePage />} />
        <Route path="/education/smart-notes" element={<RAGInterface/>} />
        <Route path="/education/quiz" element={<QuizRoom/>} />
        <Route path="/socials/hangouts" element={<Hangouts/>}/>
        <Route path="/socials/events" element={<Events/>}/>
        <Route path="/socials/hangouts/add" element={<AddHangouts/>}/>
        <Route path="/education/notes" element={<Notes />} />
        <Route path="/socials/hangouts/activities" element={<Activities/>}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

