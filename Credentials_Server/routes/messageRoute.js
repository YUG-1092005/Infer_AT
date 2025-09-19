const express = require('express');
const messageRouter = express.Router();
const {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  searchMessages
} = require('../controllers/messageController');

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

// Protected routes
messageRouter.post('/', authMiddleware, sendMessage);
messageRouter.get('/channel/:channelId', authMiddleware, getMessages);
messageRouter.patch('/:id', authMiddleware, updateMessage);
messageRouter.delete('/:id', authMiddleware, deleteMessage);
messageRouter.get('/search', authMiddleware, searchMessages);

module.exports = messageRouter;
