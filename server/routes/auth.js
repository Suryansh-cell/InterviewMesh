const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const router = express.Router();

const hasValidGoogleConfig = () => {
  const id = process.env.GOOGLE_CLIENT_ID || '';
  const secret = process.env.GOOGLE_CLIENT_SECRET || '';
  const invalidValues = ['your_google_client_id_here', 'your_google_client_secret_here', ''];
  return !invalidValues.includes(id) && !invalidValues.includes(secret);
};

const getCallbackUrl = () => `${process.env.SERVER_URL || 'http://localhost:3001'}/auth/google/callback`;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'dummy-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-secret',
  callbackURL: getCallbackUrl()
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return done(null, existing.rows[0]);
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *`,
      [profile.displayName, email, 'GOOGLE_AUTH']
    );
    return done(null, newUser.rows[0]);
  } catch (err) { return done(err, null); }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

router.get('/status', (req, res) => {
  if (!hasValidGoogleConfig()) {
    return res.status(500).json({
      ok: false,
      error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server/.env',
    });
  }
  return res.json({ ok: true });
});

// Demo bypass route for judges - creates a test user without OAuth
router.get('/demo', async (req, res) => {
  try {
    // Create or get demo user
    const demoEmail = 'demo@interviewmesh.com';
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [demoEmail]);

    let user;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
    } else {
      const newUser = await pool.query(
        `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *`,
        ['Demo User', demoEmail, 'DEMO_AUTH']
      );
      user = newUser.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.redirect(`${process.env.CLIENT_URL}/login-success?token=${token}`);
  } catch (err) {
    console.error('Demo auth error:', err);
    res.status(500).json({ error: 'Demo login failed' });
  }
});

router.get('/google', (req, res, next) => {
  if (!hasValidGoogleConfig()) {
    return res.status(500).json({
      error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server/.env',
    });
  }
  return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/?error=auth_failed` }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, name: req.user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.redirect(`${process.env.CLIENT_URL}/login-success?token=${token}`);
  }
);

// Verify token endpoint
router.get('/verify', (req, res) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ valid: false });
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
