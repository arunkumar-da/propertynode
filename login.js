const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const app = express();
const port = 3011;

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all origins
app.use(cors());

// Create a connection to the database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'systemian',
  password: 'systemian',
  database: 'propertymanagement'
});

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('Connected to the database');
});

// Route to handle user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.error('Email or password missing');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if the user exists
    const query = 'SELECT * FROM tenants WHERE Email = ?';
    db.query(query, [email], (err, results) => {
      if (err) {
        console.error('Database query error:', err.message);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }

      if (results.length > 0) {
        // User exists, now compare the hashed password
        const user = results[0];
        
        if (typeof user.password !== 'string') {
          console.error('Password from database is not a string or is undefined');
          return res.status(500).json({ error: 'Server error', details: 'Password from database is not a string or is undefined' });
        }

        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            console.error('Error comparing passwords:', err.message);
            return res.status(500).json({ error: 'Server error', details: err.message });
          }

          if (result) {
            // Passwords match
            return res.json({ success: true, message: 'Login successful' });
          } else {
            // Passwords do not match
            console.error('Password does not match');
            return res.status(401).json({ error: 'Invalid email or password' });
          }
        });
      } else {
        // User does not exist
        console.error('User not found');
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    });
  } catch (error) {
    console.error('Error during login process:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Route to handle Google login
app.post('/google-login', (req, res) => {
  const { email } = req.body;

  if (!email) {
    console.error('Email is required');
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  // Check if the email exists in the database
  const checkQuery = 'SELECT * FROM tenants WHERE Email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length > 0) {
      // Email exists in the database
      return res.json({ success: true });
    } else {
      // Email does not exist, insert it
      const insertQuery = 'INSERT INTO tenants (Email) VALUES (?)';
      db.query(insertQuery, [email], (err) => {
        if (err) {
          console.error('Database insert error:', err.message);
          return res.status(500).json({ success: false, message: 'Database insert error' });
        }

        return res.json({ success: true });
      });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
