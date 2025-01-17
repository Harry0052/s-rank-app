import React, { useContext } from 'react'; // Import useContext from React
import { UserContext } from './UserContext'; // Import UserContext from your local file
import './App.css';

const Quests = () => {
  const { user } = useContext(UserContext); // Use useContext to access UserContext

  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Quests</h1>
        {user ? (
          <div>
            <h2>Daily Quests</h2>
            <ul>
              {user.dailyQuests && user.dailyQuests.length > 0 ? (
                user.dailyQuests.map((quest, index) => (
                  <li key={index}>{quest}</li>
                ))
              ) : (
                <p>No daily quests available.</p>
              )}
            </ul>
            <h2>Side Quests</h2>
            <ul>
              {user.sideQuests && user.sideQuests.length > 0 ? (
                user.sideQuests.map((quest, index) => (
                  <li key={index}>{quest}</li>
                ))
              ) : (
                <p>No side quests available.</p>
              )}
            </ul>
          </div>
        ) : (
          <p>No user data available</p>
        )}
      </header>
    </div>
  );
};

export default Quests;