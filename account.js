// server.js

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5015; // Or any port you prefer

// MySQL database connection configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'systemian',
  password: 'systemian',
  database: 'propertymanagement'
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to database.');
});

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all origins

// Route to handle card payment update
app.post('/update-bank-payment', (req, res) => {
  const { email, accountHolderName, routingNumber, accountNumber } = req.body;

  // Validate input
  if (!email || !accountHolderName || !routingNumber || !accountNumber) {
    return res.status(400).send('All fields are required');
  }

  // Ensure email is in correct format (basic validation)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send('Invalid email format');
  }

  // Sanitize input values if necessary

  const query = `
    UPDATE tenants
    SET accountholdername = ?, routingnumber = ?, accountnumber = ?
    WHERE email = ?
  `;
  const values = [accountHolderName, routingNumber, accountNumber, email];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
      return;
    }

    // Check if any rows were affected
    if (results.affectedRows === 0) {
      return res.status(404).send('No tenant found with the provided email');
    }

    res.status(200).send('Payment information updated successfully');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
