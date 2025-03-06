import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Create an Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_PASS, // Your Gmail password or app-specific password
  },
});

// Email options with Accept Invitation button
const mailOptions = {
  from: { name: '👻 ons',
          address: process.env.GMAIL_USER! },
  to: 'zeidimohamedtaher@gmail.com',
  subject: 'Invitation to Join Our Platform',
  text: 'Hello, please click the link to accept the invitation.',
  html: `
    <b>Hello </b>
    <p>Click the button below to accept the invitation:</p>
    <a href="http://example.com/accept-invitation" style="
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      border-radius: 5px;
      margin-top: 10px;
    ">Accept Invitation</a>
  `,
};

// Endpoint to send email when called
app.post('/send-invitation', async (req, res) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId); // Log message ID for success
    res.json({ message: 'Email sent successfully!' }); // Send response back to the client
  } catch (error) {
    console.error('Error sending email:', error); // Log error if it occurs
    res.status(500).json({ error: 'Error sending email' }); // Send error response
  }
});

// Handle the URL for accepting the invitation
app.get('/accept-invitation', (req, res) => {
  res.send('You have accepted the invitation!');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
