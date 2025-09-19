const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'doc', 'image', 'file', 'urgent', 'jobcard', 'system', 'voice', 'video'],
    default: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  flags: {
    important: {
      type: Boolean,
      default: false
    },
    pinned: {
      type: Boolean,
      default: false
    },
    edited: {
      type: Boolean,
      default: false
    },
    deleted: {
      type: Boolean,
      default: false
    }
  },
  deadline: {
    type: Date,
    default: null
  },
  jobCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobCard',
    default: null
  },
  // Enhanced features for modern chat
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    thumbnail: String
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent', 'critical'],
    default: 'normal'
  },
  metadata: {
    theme: String,
    style: String,
    customData: mongoose.Schema.Types.Mixed
  }
});

module.exports = mongoose.model('Message', messageSchema);
