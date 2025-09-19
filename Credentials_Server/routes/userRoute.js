const express = require('express');
const userRouter = express.Router();
const jwt = require('jsonwebtoken');
const {
  signup,
  login,
  // getProfile,
  listUsers,
  updateUser,
  deleteUser,
  logout,
  getUserById
} = require('../controllers/userController');

const channelController = require('../controllers/channelController');
const messageController = require('../controllers/messageController');
const jobCardController = require('../controllers/jobCardController');

// Simple auth middleware (checks Bearer token, sets req.user)
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  console.log("Auth Header:", req.headers.authorization);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'JWT_SECRET not configured' });
    }
    const decoded = jwt.verify(token, jwtSecret);
    req.user = { id: decoded.id, role: decoded.role, shortId: decoded.shortId };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Public
userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.post('/logout', authMiddleware, logout);

// Protected
userRouter.get('/users/:id', authMiddleware, getUserById);
userRouter.get('/users', authMiddleware, listUsers);
userRouter.patch('/users/:id', authMiddleware, updateUser);
userRouter.delete('/users/:id', authMiddleware, deleteUser);

// Channels routes
userRouter.post('/channels', authMiddleware, channelController.createChannel);
userRouter.get('/channels', authMiddleware, channelController.getChannels);
userRouter.get('/channels/:id', authMiddleware, channelController.getChannel);
userRouter.patch('/channels/:id', authMiddleware, channelController.updateChannel);
userRouter.delete('/channels/:id', authMiddleware, channelController.deleteChannel);

// Messages routes
userRouter.post('/messages', authMiddleware, messageController.sendMessage);
userRouter.get('/messages/:channelId', authMiddleware, messageController.getMessages);

// JobCards routes
userRouter.post('/jobcards', authMiddleware, jobCardController.createJobCard);
userRouter.get('/jobcards', authMiddleware, jobCardController.getAllJobCards);
userRouter.get('/jobcards/:channelId', authMiddleware, jobCardController.getJobCards);
userRouter.patch('/jobcards/:id', authMiddleware, jobCardController.updateJobCard);
userRouter.delete('/jobcards/:id', authMiddleware, jobCardController.deleteJobCard);

module.exports = userRouter;
