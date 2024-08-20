// server.js

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5013; // Or any port you prefer

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
app.post('/update-card-payment', (req, res) => {
  const { email, cardholdername, cardnumber, cvc, month, year } = req.body;

  // Validate input here if needed

  const query = `
    UPDATE tenants
    SET cardholdername = ?, cardnumber = ?, cvc = ?, month = ?, year = ?
    WHERE email = ?
  `;
  const values = [cardholdername, cardnumber, cvc, month, year, email];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
      return;
    }
    res.status(200).send('Payment information updated successfully');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
