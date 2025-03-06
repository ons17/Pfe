import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import bodyParser from 'body-parser';
import { body, validationResult } from 'express-validator';
import sql from 'mssql';
import './auth'; // Import the Google OAuth configuration
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const dbConfig = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  server: process.env.DB_SERVER!,
  database: process.env.DB_NAME!,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Middleware to check if user is logged in
function isLoggedIn(req: any, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Configure middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'cats',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Add debug middleware to see session and user info
app.use((req: any, res: Response, next: NextFunction) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  console.log('Authenticated:', req.isAuthenticated());
  next();
});

// Home route
app.get('/', (req: Request, res: Response) => {
  res.send(`
    <h1>Authentication Demo</h1>
    <a href="/auth/google">Authenticate with Google</a> <br>
    <a href="/login">Login with Email/Password</a>
  `);
});

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    prompt: 'select_account' // Add this line to prompt account selection
  })
);

app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/google/failure'
  })
);

// Protected route
app.get('/protected', isLoggedIn, (req: any, res: Response) => {
  let displayName = 'User';

  if (req.user) {
    if (req.user.displayName) {
      displayName = req.user.displayName;
    } else if (req.user.name) {
      displayName = req.user.name;
    } else if (req.user.emails && req.user.emails[0]) {
      displayName = req.user.emails[0].value;
    } else if (req.user.email) {
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
app.get('/logout', (req: any, res: Response, next: NextFunction) => {
  req.logout((err: Error) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err: Error) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('connect.sid', { path: '/' });
      res.redirect('/');
    });
  });
});

// Google authentication failure
app.get('/auth/google/failure', (req: Request, res: Response) => {
  res.send(`
    <h1>Authentication Failed</h1>
    <p>Failed to authenticate or you are not authorized to access this application.</p>
    <a href="/">Back to Home</a>
  `);
});

// Login form route
app.get('/login', (req: Request, res: Response) => {
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
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT * FROM users WHERE email = ${email}`;
    const user = result.recordset[0];

    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    // In production, use bcrypt.compare here
    if (user.password === password) {
      req.login(user, (err: any) => {
        if (err) {
          next(err);
          return;
        }
        res.redirect('/protected');
        return;
      });
    } else {
      res.status(401).send('Invalid password');
      return;
    }
  } catch (err) {
    next(err);
  }
});

// Starting the server
app.listen(5000, () => console.log('Server listening on port 5000'));