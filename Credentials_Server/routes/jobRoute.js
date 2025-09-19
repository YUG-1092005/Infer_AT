const express = require('express');
const jobRouter = express.Router();
const {
  createJobCard,
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_me');
    req.user = { id: decoded.id, role: decoded.role, shortId: decoded.shortId };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Jobs API routes (mapping to jobCard functionality)
jobRouter.get('/', authMiddleware, getAllJobCards);
jobRouter.post('/', authMiddleware, createJobCard);
jobRouter.get('/:id', authMiddleware, getJobCardById);
jobRouter.put('/:id', authMiddleware, updateJobCard);
jobRouter.delete('/:id', authMiddleware, deleteJobCard);

module.exports = jobRouter;