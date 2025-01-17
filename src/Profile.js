import React, { useContext } from 'react';
import { UserContext } from './UserContext';
import './App.css';

const Profile = () => {
  const { user } = useContext(UserContext);

  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Profile</h1>
        {user ? (
          <div>
            <p>Username: {user.username}</p>
            <p>Level: {user.level}</p>
            <p>Experience: {user.experience}</p>
          </div>
        ) : (
          <p>No user data available</p>
        )}
      </header>
    </div>
  );
};

export default Profile;