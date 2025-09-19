const express = require('express');
const emailRouter = express.Router();
const { sendChannelInvite, acceptInvitation } = require('../controllers/emailController');

// Import auth middleware
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_me');
    req.user = { id: decoded.id, role: decoded.role, shortId: decoded.shortId };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Email routes
emailRouter.post('/invite', authMiddleware, sendChannelInvite);
emailRouter.get('/join/:token', acceptInvitation);

module.exports = emailRouter;