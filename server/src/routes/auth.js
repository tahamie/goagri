const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'goagri-secure-jwt-secret-phase1-2026';

// Secure Login Endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please enter both email address and password.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Incorrect email address or password. Please try again.' });
    }

    const user = rows[0];

    // Check bcrypt password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect email address or password. Please try again.' });
    }

    // Generate JWT Token (valid for 24 hours)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    delete user.password_hash;

    res.json({
      success: true,
      message: 'Signed in successfully.',
      user,
      token
    });
  } catch (error) {
    console.error('Auth login error:', error);
    res.status(500).json({ success: false, error: 'Unable to sign in right now. Please try again in a moment.' });
  }
});

// Validate JWT Token & return user profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Your session has expired. Please sign in again.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const [rows] = await pool.query('SELECT id, full_name, email, role, avatar_initials FROM users WHERE id = ?', [decoded.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User account could not be found.' });
    }

    res.json({ success: true, user: rows[0] });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Your session has expired. Please sign in again.' });
  }
});

module.exports = router;
