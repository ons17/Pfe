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
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_validator_1 = require("express-validator");
const mssql_1 = __importDefault(require("mssql"));
require("./auth"); // Import the Google OAuth configuration
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};
// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}
// Configure middleware
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, express_session_1.default)({
    secret: 'cats',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Add debug middleware to see session and user info
app.use((req, res, next) => {
    console.log('Session:', req.session);
    console.log('User:', req.user);
    console.log('Authenticated:', req.isAuthenticated());
    next();
});
// Home route
app.get('/', (req, res) => {
    res.send(`
    <h1>Authentication Demo</h1>
    <a href="/auth/google">Authenticate with Google</a> <br>
    <a href="/login">Login with Email/Password</a>
  `);
});
// Google OAuth routes
app.get('/auth/google', passport_1.default.authenticate('google', {
    scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ],
    prompt: 'select_account' // Add this line to prompt account selection
}));
app.get('/auth/google/callback', passport_1.default.authenticate('google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/google/failure'
}));
// Protected route
app.get('/protected', isLoggedIn, (req, res) => {
    let displayName = 'User';
    if (req.user) {
        if (req.user.displayName) {
            displayName = req.user.displayName;
        }
        else if (req.user.name) {
            displayName = req.user.name;
        }
        else if (req.user.emails && req.user.emails[0]) {
            displayName = req.user.emails[0].value;
        }
        else if (req.user.email) {
            displayName = req.user.email;
        }
    }
    res.send(`
    <h1>Welcome, ${displayName}!</h1>
    <p>You are logged in successfully.</p>
    <a href="/logout">Logout</a>
  `);
});
// Logout route
app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }
            res.clearCookie('connect.sid', { path: '/' });
            res.redirect('/');
        });
    });
});
// Google authentication failure
app.get('/auth/google/failure', (req, res) => {
    res.send(`
    <h1>Authentication Failed</h1>
    <p>Failed to authenticate or you are not authorized to access this application.</p>
    <a href="/">Back to Home</a>
  `);
});
// Login form route
app.get('/login', (req, res) => {
    res.send(`
    <h1>Login</h1>
    <form action="/login" method="post">
      <div>
        <label>Email:</label>
        <input type="email" name="email" required>
      </div>
      <div>
        <label>Password:</label>
        <input type="password" name="password" required>
      </div>
      <button type="submit">Login</button>
    </form>
    <p>Or <a href="/auth/google">Sign in with Google</a></p>
  `);
});
// POST login handler
app.post('/login', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email format'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { email, password } = req.body;
    try {
        yield mssql_1.default.connect(dbConfig);
        const result = yield mssql_1.default.query `SELECT * FROM users WHERE email = ${email}`;
        const user = result.recordset[0];
        if (!user) {
            res.status(404).send('User not found');
            return;
        }
        // In production, use bcrypt.compare here
        if (user.password === password) {
            req.login(user, (err) => {
                if (err) {
                    next(err);
                    return;
                }
                res.redirect('/protected');
                return;
            });
        }
        else {
            res.status(401).send('Invalid password');
            return;
        }
    }
    catch (err) {
        next(err);
    }
}));
// Starting the server
app.listen(5000, () => console.log('Server listening on port 5000'));
