const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Connect to SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database(process.env.DATABASE_URL || './database.db');

// Create users table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      level TEXT DEFAULT 'E',
      experience INTEGER DEFAULT 0,
      dailyQuests TEXT DEFAULT '[]',
      sideQuests TEXT DEFAULT '[]'
    )
  `);
});

// Function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Function to compare passwords
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = { db, hashPassword, comparePassword };