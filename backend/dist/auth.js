"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
// Google OAuth2 credentials
const GOOGLE_CLIENT_ID = '17543999702-hf3su5dua5q1fuhfmeth5a6mgtf2acce.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
// Configure the Google strategy for Passport
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback",
    passReqToCallback: true
}, function (request, accessToken, refreshToken, profile, done) {
    console.log("Profile received:", JSON.stringify(profile, null, 2)); // Debug log
    // The email is typically found in profile.emails[0].value
    const userEmail = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    console.log("User email:", userEmail); // Debug log
    // Only authorize the specific email
    if (userEmail === 'onssbenamara3@gmail.com') {
        return done(null, profile);
    }
    else {
        return done(null, false, { message: 'You are not authorized to access this application.' });
    }
}));
// Serialize user to store in session
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((obj, done) => {
    done(null, obj);
});
exports.default = passport_1.default;
