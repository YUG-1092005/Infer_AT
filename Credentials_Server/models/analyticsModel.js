const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['ocr_scan', 'login', 'message_sent', 'job_created', 'channel_created', 'page_view'],
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
});

const systemMetricsSchema = new mongoose.Schema({
  serverStatus: {
    type: String,
    enum: ['online', 'offline', 'maintenance'],
    default: 'online'
  },
  cpuUsage: Number,
  memoryUsage: Number,
  activeUsers: Number,
  totalRequests: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Analytics = mongoose.model('Analytics', analyticsSchema);
const SystemMetrics = mongoose.model('SystemMetrics', systemMetricsSchema);

module.exports = { Analytics, SystemMetrics };