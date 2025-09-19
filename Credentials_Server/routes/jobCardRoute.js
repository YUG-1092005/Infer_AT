const express = require('express');
const jobCardRouter = express.Router();
const {
  createJobCard,
  getJobCards,
  getAllJobCards,
  getJobCardById,
  updateJobCard,
  deleteJobCard
} = require('../controllers/jobCardController');

// Import auth middleware
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
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

// Protected routes - specific routes first, then parameterized routes
jobCardRouter.post('/', authMiddleware, createJobCard);
jobCardRouter.get('/', authMiddleware, getAllJobCards);
jobCardRouter.get('/channel/:channelId', authMiddleware, getJobCards);
jobCardRouter.get('/:id', authMiddleware, getJobCardById);
jobCardRouter.patch('/:id', authMiddleware, updateJobCard);
jobCardRouter.delete('/:id', authMiddleware, deleteJobCard);

module.exports = jobCardRouter;
