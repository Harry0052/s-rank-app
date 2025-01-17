import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './App.css';

const LevelingApp = () => {
  const { user, setUser } = useContext(UserContext);
  const [penalty, setPenalty] = useState(false);
  const [failedQuest, setFailedQuest] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('24:00:00');
  const navigate = useNavigate();

  // Load user data from context with fallback defaults
  const { level = 'E', experience = 0, dailyQuests = [], sideQuests = [] } = user || {};

  // Define level requirements using useMemo
  const levelRequirements = useMemo(() => ({
    E: 0,
    D: 2500,
    C: 50000,
    B: 100000,
    A: 500000,
    S: 1000000,
  }), []);

  // Fetch user data from the backend on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/user?username=${user.username}`);
        const data = await response.json();
        if (response.ok) {
          setUser(data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    if (user?.username) {
      fetchUser();
    }
  }, [user?.username, setUser]);

  // Check if the player levels up
  useEffect(() => {
    const checkLevelUp = async () => {
      const levels = ['E', 'D', 'C', 'B', 'A', 'S'];
      const currentIndex = levels.indexOf(level);

      // Check if the user has enough experience to level up
      if (currentIndex < levels.length - 1 && experience >= levelRequirements[levels[currentIndex + 1]]) {
        const newLevel = levels[currentIndex + 1];
        const updatedUser = { ...user, level: newLevel };

        // Update the user in the backend
        try {
          const response = await fetch('http://localhost:5001/api/user', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser),
          });

          if (response.ok) {
            setUser(updatedUser);
            alert(`Congratulations! You leveled up to ${newLevel}!`);
          }
        } catch (error) {
          console.error('Error updating user:', error);
        }
      }
    };

    checkLevelUp();
  }, [experience, level, levelRequirements, setUser, user]);

  // Calculate progress for the progress bar (ensure it doesn't exceed 100%)
  const currentLevelIndex = ['E', 'D', 'C', 'B', 'A', 'S'].indexOf(level);
  const nextLevel = ['E', 'D', 'C', 'B', 'A', 'S'][currentLevelIndex + 1] || 'S';
  const nextLevelRequirement = levelRequirements[nextLevel];
  const progress = Math.min((experience / nextLevelRequirement) * 100, 100); // Cap progress at 100%

  // Complete a daily quest
  const completeDailyQuest = async (quest) => {
    if (!dailyQuests.includes(quest)) {
      const updatedDailyQuests = [...dailyQuests, quest];
      const updatedExperience = experience + 100; // Daily quests give 100 XP
      const updatedUser = { ...user, dailyQuests: updatedDailyQuests, experience: updatedExperience };

      // Update the user in the backend
      try {
        const response = await fetch('http://localhost:5001/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        });

        if (response.ok) {
          setUser(updatedUser);
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
    }
  };

  // Complete a side quest
  const completeSideQuest = async (quest) => {
    if (!sideQuests.includes(quest)) {
      const updatedSideQuests = [...sideQuests, quest];
      const updatedExperience = experience + 500; // Side quests give 500 XP
      const updatedUser = { ...user, sideQuests: updatedSideQuests, experience: updatedExperience };

      // Update the user in the backend
      try {
        const response = await fetch('http://localhost:5001/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        });

        if (response.ok) {
          setUser(updatedUser);
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
    }
  };

  // Fail a daily quest
  const failDailyQuest = async () => {
    setFailedQuest(true);
    setPenalty(true);
    const updatedExperience = Math.max(0, experience - 1000); // Lose 1000 XP for failing
    const updatedUser = { ...user, experience: updatedExperience };

    // Update the user in the backend
    try {
      const response = await fetch('http://localhost:5001/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        setUser(updatedUser);
        alert('You failed a daily quest! -1000 XP penalty applied.');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Timer logic
  useEffect(() => {
    const lastResetTime = localStorage.getItem('lastResetTime');
    const now = new Date().getTime();

    // If 24 hours have passed since the last reset
    if (lastResetTime && now - lastResetTime >= 24 * 60 * 60 * 1000) {
      // Check if all daily quests are completed
      if (dailyQuests.length < 4) {
        setPenalty(true);
        const updatedExperience = Math.max(0, experience - 1000); // Apply penalty
        const updatedUser = { ...user, experience: updatedExperience, dailyQuests: [] };

        // Update the user in the backend
        const updateUser = async () => {
          try {
            const response = await fetch('http://localhost:5001/api/user', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedUser),
            });

            if (response.ok) {
              setUser(updatedUser);
              alert('You failed to complete all daily quests within 24 hours! -1000 XP penalty applied.');
            }
          } catch (error) {
            console.error('Error updating user:', error);
          }
        };

        updateUser();
      }

      // Reset daily quests and update last reset time
      const updatedUser = { ...user, dailyQuests: [] };
      setUser(updatedUser);
      localStorage.setItem('lastResetTime', now);
    } else if (!lastResetTime) {
      // Set the initial reset time
      localStorage.setItem('lastResetTime', now);
    }

    // Countdown timer
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const nextResetTime = parseInt(localStorage.getItem('lastResetTime')) + 24 * 60 * 60 * 1000;
      const timeLeft = nextResetTime - currentTime;

      if (timeLeft <= 0) {
        // Reset the timer and update the last reset time
        localStorage.setItem('lastResetTime', currentTime);
        setTimeRemaining('24:00:00');
      } else {
        // Calculate hours, minutes, and seconds
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        // Format the time as HH:MM:SS
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        setTimeRemaining(formattedTime);
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [dailyQuests, experience, setUser, user]);

  // Log out
  const handleLogout = () => {
    setUser(null); // Clear the user from context
    navigate('/login');
  };

  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Solo Leveling App</h1>
        <button onClick={handleLogout} style={{ position: 'absolute', top: 20, right: 20 }}>
          Log Out
        </button>
        <p>Current Level: {level}</p>
        <p>Experience: {experience} / {nextLevelRequirement}</p>
        <div className='progress-bar-container'>
          <div
            className='progress-bar'
            style={{ width: `${progress}%` }}
          >
            {progress.toFixed(2)}%
          </div>
        </div>
        <p>Time until reset: {timeRemaining}</p>
        <div className='quests-container'>
          <h2>Daily Quests</h2>
          {!dailyQuests.includes('Run 5km') && !failedQuest && (
            <button onClick={() => completeDailyQuest('Run 5km')}>Run 5km</button>
          )}
          {!dailyQuests.includes('50 Push-ups') && !failedQuest && (
            <button onClick={() => completeDailyQuest('50 Push-ups')}>50 Push-ups</button>
          )}
          {!dailyQuests.includes('50 Sit-ups') && !failedQuest && (
            <button onClick={() => completeDailyQuest('50 Sit-ups')}>50 Sit-ups</button>
          )}
          {!dailyQuests.includes('50 Pull-ups') && !failedQuest && (
            <button onClick={() => completeDailyQuest('50 Pull-ups')}>50 Pull-ups</button>
          )}
          {!failedQuest && (
            <button onClick={failDailyQuest}>Fail Daily Quest</button>
          )}
        </div>
        <div className='quests-container'>
          <h2>Side Quests</h2>
          {!sideQuests.includes('Lift 100kg') && (
            <button onClick={() => completeSideQuest('Lift 100kg')}>Lift 100kg</button>
          )}
          {!sideQuests.includes('Run 10km') && (
            <button onClick={() => completeSideQuest('Run 10km')}>Run 10km</button>
          )}
          {!sideQuests.includes('100 Push-ups') && (
            <button onClick={() => completeSideQuest('100 Push-ups')}>100 Push-ups</button>
          )}
          {!sideQuests.includes('100 Sit-ups') && (
            <button onClick={() => completeSideQuest('100 Sit-ups')}>100 Sit-ups</button>
          )}
          {!sideQuests.includes('100 Pull-ups') && (
            <button onClick={() => completeSideQuest('100 Pull-ups')}>100 Pull-ups</button>
          )}
        </div>
        {penalty && <p>Penalty Applied: -1000 Experience</p>}
      </header>
    </div>
  );
};

export default LevelingApp;