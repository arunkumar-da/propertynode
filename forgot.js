const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = 3012;

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

// Route to handle password change
app.post('/forgot-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required' });
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
        // User exists, update the password
        const hashedPassword = bcrypt.hashSync(newPassword, 10); // Hash the new password

        const updateQuery = 'UPDATE tenants SET Password = ? WHERE Email = ?';
        db.query(updateQuery, [hashedPassword, email], (err, result) => {
          if (err) {
            console.error('Database update error:', err.message);
            return res.status(500).json({ error: 'Database update error', details: err.message });
          }

          return res.json({ success: true, message: 'Password updated successfully' });
        });
      } else {
        // User does not exist
        return res.status(404).json({ error: 'User not found' });
      }
    });
  } catch (error) {
    console.error('Error during password change process:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Route to handle Google login
app.post('/google-login', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
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
        // User exists, return success message or token
        return res.json({ success: true, message: 'User already exists', redirect: '/dashboard' });
      } else {
        // User does not exist, insert into database
        const insertQuery = 'INSERT INTO tenants (Email) VALUES (?)';
        db.query(insertQuery, [email], (err, result) => {
          if (err) {
            console.error('Database insert error:', err.message);
            return res.status(500).json({ error: 'Database insert error', details: err.message });
          }

          return res.json({ success: true, message: 'User added successfully', redirect: '/dashboard' });
        });
      }
    });
  } catch (error) {
    console.error('Error during Google login process:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
