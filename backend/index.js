const express = require('express');
const cors = require('cors');
const { db, hashPassword, comparePassword } = require('./database');

const app = express();
const PORT = process.env.PORT || 5001; // Use Render's PORT or fallback to 5001

// Middleware
app.use(cors());
app.use(express.json());

// Sign-up endpoint
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert the new user into the database
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      function (err) {
        if (err) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(201).json({ id: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, user) => {
        if (err || !user) {
          return res.status(400).json({ error: 'User not found' });
        }

        // Compare the provided password with the hashed password
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ error: 'Invalid password' });
        }

        // Return the user data (excluding the password)
        const { password: _, ...userData } = user;
        res.status(200).json(userData);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch user data endpoint
app.get('/api/user', (req, res) => {
  const { username } = req.query;

  try {
    // Find the user in the database
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      (err, user) => {
        if (err || !user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Return the user data (excluding the password)
        const { password: _, ...userData } = user;
        res.status(200).json(userData);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user data endpoint
app.put('/api/user', (req, res) => {
  const { username, level, experience, dailyQuests, sideQuests } = req.body;

  try {
    // Update the user in the database
    db.run(
      'UPDATE users SET level = ?, experience = ?, dailyQuests = ?, sideQuests = ? WHERE username = ?',
      [level, experience, JSON.stringify(dailyQuests), JSON.stringify(sideQuests), username],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update user' });
        }
        res.status(200).json({ message: 'User updated successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});