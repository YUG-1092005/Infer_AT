const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const JWT_EXPIRES_IN = '1h';

// Generate JWT token for a user
async function generateToken(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const payload = {
      id: user._id,
      username: user.username,
      role: user.role,
      shortId: user.shortId
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({ token });
  } catch (err) {
    console.error('generateToken error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  generateToken
};
