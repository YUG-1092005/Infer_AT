const Message = require('../models/messageModel');
const Channel = require('../models/channelModel');
const User = require('../models/userModel');

// Send a message
async function sendMessage(req, res) {
  try {
    const { channelId, content, type = 'text', flags, deadline, jobCardId, important } = req.body;
    const senderId = req.user.id;

    console.log('Sending message:', { channelId, content, type, flags, important, deadline });

    // Check if channel exists and user is member
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    if (!channel.members.some(member => member.toString() === senderId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Handle flags properly - support both formats
    let messageFlags = { important: false };
    if (flags && typeof flags === 'object') {
      messageFlags = flags;
    } else if (important !== undefined) {
      messageFlags.important = Boolean(important);
    }

    const newMessage = new Message({
      channelId,
      senderId,
      content,
      type,
      flags: messageFlags,
      deadline: deadline ? new Date(deadline) : null,
      jobCardId
    });

    await newMessage.save();

    // Populate sender info
    await newMessage.populate('senderId', 'fullName username');

    console.log('Message saved:', newMessage);

    // Note: Real-time event will be handled by socket.io in index.js
    return res.status(201).json({ message: 'Message sent', data: newMessage });
  } catch (err) {
    console.error('sendMessage error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Get messages for a channel
async function getMessages(req, res) {
  try {
    const { channelId } = req.params;
    const { skip = 0, limit = 50 } = req.query;

    // Check if channel exists and user is member
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    if (!channel.members.some(member => member.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ channelId })
      .populate('senderId', 'fullName username')
      .sort({ timestamp: 1 })
      .skip(Number(skip))
      .limit(Math.min(Number(limit), 200));

    return res.json({ messages });
  } catch (err) {
    console.error('getMessages error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Update message (e.g., add flags, deadline)
async function updateMessage(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Only sender can update
    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
    if (updates.flags !== undefined) message.flags = updates.flags;
    if (updates.deadline !== undefined) message.deadline = updates.deadline ? new Date(updates.deadline) : null;

    await message.save();

    return res.json({ message: 'Message updated', message });
  } catch (err) {
    console.error('updateMessage error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Delete message
async function deleteMessage(req, res) {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Only sender or org-admin can delete
    const user = await User.findById(req.user.id);
    if (message.senderId.toString() !== req.user.id && user.role !== 'org-admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Message.findByIdAndDelete(id);

    return res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('deleteMessage error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Search messages
async function searchMessages(req, res) {
  try {
    const { query, channelId, filter = 'all' } = req.query;

    let searchQuery = {};

    // If channelId provided, limit to that channel
    if (channelId) {
      const channel = await Channel.findById(channelId);
      if (!channel || !channel.members.some(member => member.toString() === req.user.id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      searchQuery.channelId = channelId;
    } else {
      // Get user's channels
      const user = await User.findById(req.user.id);
      const channels = await Channel.find({ department: user.department }).select('_id');
      searchQuery.channelId = { $in: channels.map(c => c._id) };
    }

    // Apply filters
    if (filter === 'deadline') {
      searchQuery.deadline = { $exists: true, $ne: null };
      // Sort by deadline ascending
    } else if (filter === 'important') {
      searchQuery['flags.important'] = true;
    } else if (filter === 'jobcard') {
      searchQuery.jobCardId = { $exists: true, $ne: null };
    }

    // Text search
    if (query) {
      searchQuery.$text = { $search: query };
    }

    const messages = await Message.find(searchQuery)
      .populate('senderId', 'fullName username')
      .populate('channelId', 'name')
      .sort(filter === 'deadline' ? { deadline: 1 } : { timestamp: -1 })
      .limit(100);

    return res.json({ messages });
  } catch (err) {
    console.error('searchMessages error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  searchMessages
};
