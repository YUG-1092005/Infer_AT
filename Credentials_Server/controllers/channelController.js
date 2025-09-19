const Channel = require('../models/channelModel');
const User = require('../models/userModel');
const path = require('path');

// Create a new channel
async function createChannel(req, res) {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if user has a department
    if (!user.department) {
      return res.status(400).json({ message: 'User department is not set. Please contact administrator.' });
    }

    const department = user.department;
    const createdBy = req.user.id;

    // Check if channel with same name and department exists
    const existingChannel = await Channel.findOne({ name, department });
    if (existingChannel) {
      return res.status(400).json({ message: 'Channel with this name already exists in the department' });
    }

    // Only add the creator as initial member
    const members = [createdBy];

    const newChannel = new Channel({
      name,
      department,
      members,
      createdBy
    });

    await newChannel.save();

    return res.status(201).json({ message: 'Channel created successfully', channel: newChannel });
  } catch (err) {
    console.error('createChannel error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Get all channels
async function getChannels(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const channels = await Channel.find({})
      .populate('members', 'fullName username email')
      .populate('createdBy', 'fullName username')
      .sort({ createdAt: -1 });

    // Add isMember flag for each channel
    const channelsWithMemberStatus = channels.map(channel => {
      const isMember = channel.members.some(member => member._id.toString() === req.user.id);
      return {
        ...channel.toObject(),
        isMember
      };
    });

    return res.json({ channels: channelsWithMemberStatus });
  } catch (err) {
    console.error('getChannels error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Get channel details
async function getChannel(req, res) {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id)
      .populate('members', 'fullName username email department role')
      .populate('createdBy', 'fullName username');

    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    // Check if user is member for full details
    const isMember = channel.members.some(member => member._id.toString() === req.user.id);
    if (!isMember) {
      // Return limited info for non-members
      return res.json({ 
        channel: {
          _id: channel._id,
          name: channel.name,
          department: channel.department,
          createdBy: channel.createdBy,
          createdAt: channel.createdAt,
          memberCount: channel.members.length,
          isMember: false
        }
      });
    }

    return res.json({ 
      channel: {
        ...channel.toObject(),
        isMember: true
      }
    });
  } catch (err) {
    console.error('getChannel error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Update channel (add/remove members, etc.)
async function updateChannel(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const channel = await Channel.findById(id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    // Only org-admin or dept-head can update
    const user = await User.findById(req.user.id);
    if (user.role !== 'org-admin' && user.role !== 'dept-head') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Update fields
    if (updates.name) channel.name = updates.name;
    if (updates.members) channel.members = updates.members;

    await channel.save();

    return res.json({ message: 'Channel updated', channel });
  } catch (err) {
    console.error('updateChannel error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Delete channel
async function deleteChannel(req, res) {
  try {
    const { id } = req.params;

    const channel = await Channel.findById(id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    // Only creator or org-admin can delete
    if (channel.createdBy.toString() !== req.user.id && req.user.role !== 'org-admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    await Channel.findByIdAndDelete(id);

    return res.json({ message: 'Channel deleted' });
  } catch (err) {
    console.error('deleteChannel error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Join a channel
async function joinChannel(req, res) {
  try {
    console.log('\n=== JOIN CHANNEL REQUEST ===');
    console.log('Channel ID:', req.params.id);
    console.log('User ID:', req.user.id);
    console.log('User from token:', req.user);
    
    const { id } = req.params;
    const userId = req.user.id;

    const channel = await Channel.findById(id);
    if (!channel) {
      console.log('❌ Channel not found:', id);
      return res.status(404).json({ message: 'Channel not found' });
    }
    console.log('✅ Channel found:', channel.name, 'Members:', channel.members.length);

    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('✅ User found:', user.fullName, 'Department:', user.department);

    // Check if already a member
    const isMember = channel.members.some(memberId => memberId.toString() === userId.toString());
    if (isMember) {
      console.log('⚠️ User already member of channel');
      return res.status(400).json({ message: 'Already a member of this channel' });
    }

    // Add user to channel
    channel.members.push(userId);
    await channel.save();
    console.log('✅ User added to channel successfully. New member count:', channel.members.length);

    // Emit socket event for real-time updates
    if (global.io) {
      global.io.emit('userJoinedChannel', {
        channelId: id,
        userId: userId,
        userName: user.fullName,
        message: `${user.fullName} joined the channel`
      });
      console.log('📡 Socket event emitted');
    }

    return res.json({ message: 'Successfully joined channel', channel });
  } catch (err) {
    console.error('❌ joinChannel error:', err);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
}

// Leave a channel
async function leaveChannel(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const channel = await Channel.findById(id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    // Check if user is a member
    if (!channel.members.includes(userId)) {
      return res.status(400).json({ message: 'Not a member of this channel' });
    }

    // Remove user from channel
    channel.members = channel.members.filter(member => member.toString() !== userId);
    await channel.save();

    // Get user info for notification
    const user = await User.findById(userId);
    
    return res.json({ message: 'Successfully left channel' });
  } catch (err) {
    console.error('leaveChannel error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createChannel,
  getChannels,
  getChannel,
  updateChannel,
  deleteChannel,
  joinChannel,
  leaveChannel
};
