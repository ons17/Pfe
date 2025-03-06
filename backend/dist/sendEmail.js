"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load environment variables
// Create an Express app
const app = (0, express_1.default)();
app.use(express_1.default.json()); // Middleware to parse JSON bodies
// Set up Nodemailer transporter
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // Your Gmail password or app-specific password
    },
});
// Email options with Accept Invitation button
const mailOptions = {
    from: { name: '👻 ons', address: process.env.GMAIL_USER },
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
app.post('/send-invitation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.messageId); // Log message ID for success
        res.json({ message: 'Email sent successfully!' }); // Send response back to the client
    }
    catch (error) {
        console.error('Error sending email:', error); // Log error if it occurs
        res.status(500).json({ error: 'Error sending email' }); // Send error response
    }
}));
// Handle the URL for accepting the invitation
app.get('/accept-invitation', (req, res) => {
    res.send('You have accepted the invitation!');
});
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
