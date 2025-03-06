import session from 'express-session';

export const sessionConfig = {
  secret: 'cats',
  resave: false,
  saveUninitialized: true
};
