const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;

// Database connection configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'systemian',
  password: 'systemian',
  database: 'propertymanagement'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Add Cross-Origin-Opener-Policy header
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Get user information
app.get('/api/getUserInfo', (req, res) => {
  console.log('Received request for user info:', req.query);
  const { email } = req.query;
  if (!email) {
    return res.status(400).send('Email is required');
  }
  const query = 'SELECT name, phoneNumber, address, city, state, zipCode FROM tenants WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Error retrieving user information');
    }
    if (results.length === 0) {
      return res.status(404).send('User not found');
    }
    console.log('User info retrieved:', results[0]);
    res.json(results[0]);
  });
});

// Update user information
app.post('/api/updateUserInfo', (req, res) => {
  console.log('Received request to update user info:', req.body);
  const { email, name, phoneNumber, address, city, state, zipCode } = req.body;
  if (!email) {
    return res.status(400).send('Email is required');
  }
  const query = `UPDATE tenants SET name = ?, phoneNumber = ?, address = ?, city = ?, state = ?, zipCode = ? WHERE email = ?`;
  db.query(query, [name, phoneNumber, address, city, state, zipCode, email], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Error updating user information');
    }
    console.log('User info updated:', result);
    res.send('User information updated successfully');
  });
});

// Change password
app.post('/api/changePassword', (req, res) => {
  console.log('Received request to change password');
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).send('Email, old password, and new password are required');
  }
  
  // Check if the old password matches
  db.query('SELECT password FROM tenants WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Error retrieving user');
    }
    
    if (results.length === 0 || results[0].password !== oldPassword) {
      return res.status(400).send('Old password is incorrect');
    }
    // Update the password
    db.query('UPDATE tenants SET password = ? WHERE email = ?', [newPassword, email], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Error changing password');
      }
      console.log('Password changed successfully');
      res.send('Password changed successfully');
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.end((err) => {
    if (err) {
      console.error('Error closing database connection:', err);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});