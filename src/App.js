import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './UserContext';
import SignUp from './SignUp';
import Login from './Login';
import LevelingApp from './LevelingApp';
import Profile from './Profile';
import Quests from './Quests';
import './App.css';

function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<LevelingApp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/quests" element={<Quests />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;