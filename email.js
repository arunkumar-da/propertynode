const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors

const app = express();
const port = 3000;

// Enable CORS for all origins (you can specify options if needed)
app.use(cors());

// Body parser middleware to parse JSON data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route to handle form submissions
app.post('/send-email', (req, res) => {
    const { name, email, subject, message } = req.body;

    // Example using Gmail SMTP server
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'arunkumar8667673544@gmail.com', // Replace with your Gmail address
            pass: 'hnwjrzeshayjujen' // Replace with your Gmail password or App Specific Password
        }
    });

    let mailOptions = {
        from: `${name} <${email}>`,
        to: 'arunkumar8667673544@gmail.com', // Change to your recipient email address
        subject: subject,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('Email sent successfully');
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
