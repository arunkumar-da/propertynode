const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = 3010;

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
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to the database');
});

// Route to handle user registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into the database
    const query = 'INSERT INTO tenants (Email, Password) VALUES (?, ?)';
    db.query(query, [email, hashedPassword], (err, results) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ error: 'Server error' });
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
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        // User exists, redirect to dashboard
        res.json({ success: true, redirect: '/dashboard' });
      } else {
        // User does not exist, insert into database
        const insertQuery = 'INSERT INTO tenants (Email) VALUES (?)';
        db.query(insertQuery, [email], (err, result) => {
          if (err) {
            console.error('Database insert error:', err);
            return res.status(500).json({ error: 'Database insert error' });
          }

          // After insertion, redirect to dashboard
          res.json({ success: true, redirect: '/dashboard' });
        });
      }
    });
  } catch (error) {
    console.error('Error during Google login process:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
