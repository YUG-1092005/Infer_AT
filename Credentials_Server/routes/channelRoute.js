const express = require('express');
const channelRouter = express.Router();
const {
  createChannel,
  getChannels,
  getChannel,
  updateChannel,
  deleteChannel,
  joinChannel,
  leaveChannel
} = require('../controllers/channelController');

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
channelRouter.post('/', authMiddleware, createChannel);
channelRouter.get('/', authMiddleware, getChannels);
channelRouter.get('/:id', authMiddleware, getChannel);
channelRouter.patch('/:id', authMiddleware, updateChannel);
channelRouter.delete('/:id', authMiddleware, deleteChannel);
channelRouter.post('/:id/join', authMiddleware, joinChannel);
channelRouter.post('/:id/leave', authMiddleware, leaveChannel);

module.exports = channelRouter;
