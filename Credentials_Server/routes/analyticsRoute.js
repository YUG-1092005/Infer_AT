const express = require('express');
const analyticsRouter = express.Router();
const {
  trackAction,
  getDashboardData,
  getRealtimeMetrics,
  getOCRStats
} = require('../controllers/analyticsController');

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

// Analytics routes
analyticsRouter.post('/track', authMiddleware, trackAction);
analyticsRouter.get('/dashboard', authMiddleware, getDashboardData);
analyticsRouter.get('/realtime', authMiddleware, getRealtimeMetrics);
analyticsRouter.get('/ocr', authMiddleware, getOCRStats);

module.exports = analyticsRouter;