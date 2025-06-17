// facebook-server/app.js
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const sql = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const friendRoutes = require('./src/routes/friend');
const postRoutes = require('./src/routes/post');
const User = require('./src/models/user');
require('dotenv').config();
const app = express();

console.log('Starting server...'); // Log khi khởi động

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log('Google Strategy triggered with profile:', profile); // Log khi chiến lược được gọi
    try {
      let user = await User.findByGoogleId(profile.id);
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value
        });
      }
      done(null, user);
    } catch (err) {
      console.error('Error in Google Strategy:', err);
      done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id); // Log khi serialize
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  console.log('Deserializing user:', id); // Log khi deserialize
  const user = await User.findById(id);
  done(null, user);
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || '5000';
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`); // Log khi server khởi động thành công
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        avatar TEXT
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS friends (
        user_id INTEGER REFERENCES users(id),
        friend_id INTEGER REFERENCES users(id),
        PRIMARY KEY (user_id, friend_id)
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id),
        receiver_id INTEGER REFERENCES users(id),
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        content TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
  } catch (err) {
    console.error('Database initialization error:', err.stack);
  }
});

module.exports = app;