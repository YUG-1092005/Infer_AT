const JobCard = require('../models/jobCardModel');
const Channel = require('../models/channelModel');
const User = require('../models/userModel');
const Message = require('../models/messageModel');

// Create a job card
async function createJobCard(req, res) {
  try {
    const { title, description, assignedTo, deadline, channelId, priority, department } = req.body;
    const createdBy = req.user.id;

    // If channelId is provided, validate it
    if (channelId) {
      const channel = await Channel.findById(channelId);
      if (!channel) return res.status(404).json({ message: 'Channel not found' });

      if (!channel.members.some(member => member.toString() === createdBy)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Check if assignedTo is in the channel
      if (assignedTo && !channel.members.some(member => member.toString() === assignedTo)) {
        return res.status(400).json({ message: 'Assigned user is not a member of the channel' });
      }
    }

    const newJobCard = new JobCard({
      title,
      description,
      assignedTo: assignedTo || null,
      deadline: deadline ? new Date(deadline) : null,
      createdBy,
      channelId: channelId || null,
      priority: priority || 'medium'
    });

    await newJobCard.save();

    // Populate all related data
    await newJobCard.populate('assignedTo', 'fullName username department role');
    await newJobCard.populate('createdBy', 'fullName username department role');
    if (newJobCard.channelId) {
      await newJobCard.populate('channelId', 'name description');
    }

    // Create and send message to channel (only if channelId exists)
    if (channelId) {
      const assigneeName = newJobCard.assignedTo ? newJobCard.assignedTo.fullName : 'Not assigned';
      const messageContent = `📋 **Job Card Created**\n\n**Title:** ${title}\n**Assigned to:** ${assigneeName}\n**Channel:** ${newJobCard.channelId?.name || 'N/A'}\n**Priority:** ${newJobCard.priority.toUpperCase()}\n**Due:** ${deadline ? new Date(deadline).toLocaleDateString() : 'Not set'}\n\n**Description:**\n${description}`;
      
      const jobMessage = new Message({
        channelId,
        senderId: createdBy,
        content: messageContent,
        type: 'text',
        jobCardId: newJobCard._id,
        flags: { important: true }
      });
      
      await jobMessage.save();
      
      // Emit socket event for real-time message
      if (global.io) {
        global.io.to(channelId).emit('newMessage', {
          ...jobMessage.toObject(),
          senderId: { _id: createdBy, fullName: req.user.fullName || 'User' }
        });
      }
    }

    // Return job in frontend format
    const jobResponse = {
      id: newJobCard._id,
      title: newJobCard.title,
      description: newJobCard.description,
      department: newJobCard.assignedTo?.department || newJobCard.createdBy?.department || 'General',
      createdBy: {
        id: newJobCard.createdBy._id,
        name: newJobCard.createdBy.fullName
      },
      assignedTo: newJobCard.assignedTo ? {
        id: newJobCard.assignedTo._id,
        name: newJobCard.assignedTo.fullName
      } : null,
      status: newJobCard.status,
      priority: newJobCard.priority,
      createdDate: newJobCard.createdAt,
      deadline: newJobCard.deadline,
      progress: 0
    };

    return res.status(201).json({ message: 'Job created successfully', job: jobResponse });
  } catch (err) {
    console.error('createJobCard error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Get job cards for a channel
async function getJobCards(req, res) {
  try {
    const { channelId } = req.params;

    // Check if channel exists and user is member
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    if (!channel.members.some(member => member.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const jobCards = await JobCard.find({ channelId })
      .populate('assignedTo', 'fullName username')
      .populate('createdBy', 'fullName username')
      .sort({ createdAt: -1 });

    return res.json({ jobCards });
  } catch (err) {
    console.error('getJobCards error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Update job card
async function updateJobCard(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const jobCard = await JobCard.findById(id);
    if (!jobCard) return res.status(404).json({ message: 'Job card not found' });

    // Only creator or assigned user can update
    if (jobCard.createdBy.toString() !== req.user.id && jobCard.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
    if (updates.title) jobCard.title = updates.title;
    if (updates.description) jobCard.description = updates.description;
    if (updates.status) jobCard.status = updates.status;
    if (updates.priority) jobCard.priority = updates.priority;
    if (updates.deadline !== undefined) jobCard.deadline = updates.deadline ? new Date(updates.deadline) : null;
    if (updates.assignedTo !== undefined) jobCard.assignedTo = updates.assignedTo;

    await jobCard.save();
    
    // Populate all related data
    await jobCard.populate('assignedTo', 'fullName username department role');
    await jobCard.populate('createdBy', 'fullName username department role');
    await jobCard.populate('channelId', 'name description');

    // Return job in frontend format
    const jobResponse = {
      id: jobCard._id,
      title: jobCard.title,
      description: jobCard.description,
      department: jobCard.assignedTo?.department || jobCard.createdBy?.department || 'General',
      createdBy: {
        id: jobCard.createdBy._id,
        name: jobCard.createdBy.fullName
      },
      assignedTo: jobCard.assignedTo ? {
        id: jobCard.assignedTo._id,
        name: jobCard.assignedTo.fullName
      } : null,
      status: jobCard.status,
      priority: jobCard.priority,
      createdDate: jobCard.createdAt,
      deadline: jobCard.deadline,
      progress: jobCard.status === 'completed' ? 100 : jobCard.status === 'in-progress' ? 50 : 0
    };

    return res.json({ message: 'Job updated successfully', job: jobResponse });
  } catch (err) {
    console.error('updateJobCard error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Delete job card
async function deleteJobCard(req, res) {
  try {
    const { id } = req.params;

    const jobCard = await JobCard.findById(id);
    if (!jobCard) return res.status(404).json({ message: 'Job card not found' });

    // Only creator or org-admin can delete
    const user = await User.findById(req.user.id);
    if (jobCard.createdBy.toString() !== req.user.id && user.role !== 'org-admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await JobCard.findByIdAndDelete(id);

    return res.json({ message: 'Job card deleted' });
  } catch (err) {
    console.error('deleteJobCard error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Get all job cards for current user
async function getAllJobCards(req, res) {
  try {
    const userId = req.user.id;
    
    const jobCards = await JobCard.find({
      $or: [
        { createdBy: userId },
        { assignedTo: userId }
      ]
    })
    .populate('assignedTo', 'fullName username department role')
    .populate('createdBy', 'fullName username department role')
    .populate('channelId', 'name')
    .sort({ createdAt: -1 });

    // Transform to match frontend expectations
    const jobs = jobCards.map(job => ({
      id: job._id,
      title: job.title,
      description: job.description,
      department: job.assignedTo?.department || job.createdBy?.department || 'General',
      createdBy: {
        id: job.createdBy?._id,
        name: job.createdBy?.fullName || 'Unknown'
      },
      assignedTo: job.assignedTo ? {
        id: job.assignedTo._id,
        name: job.assignedTo.fullName
      } : null,
      status: job.status,
      priority: job.priority || 'medium',
      createdDate: job.createdAt,
      deadline: job.deadline,
      progress: job.status === 'completed' ? 100 : job.status === 'in-progress' ? 50 : 0
    }));

    return res.json({ jobs });
  } catch (err) {
    console.error('getAllJobCards error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Get single job card by ID
async function getJobCardById(req, res) {
  try {
    console.log('getJobCardById called with ID:', req.params.id);
    const { id } = req.params;
    const userId = req.user.id;
    
    const jobCard = await JobCard.findById(id)
      .populate('assignedTo', 'fullName username')
      .populate('createdBy', 'fullName username')
      .populate('channelId', 'name');
    
    if (!jobCard) {
      console.log('Job card not found for ID:', id);
      return res.status(404).json({ message: 'Job card not found' });
    }
    
    // Check if user has access (creator, assignee, or channel member)
    const channel = await Channel.findById(jobCard.channelId._id);
    if (!channel || !channel.members.some(member => member.toString() === userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    console.log('Returning job card:', jobCard.title);
    return res.json({ jobCard });
  } catch (err) {
    console.error('getJobCardById error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createJobCard,
  getJobCards,
  getAllJobCards,
  getJobCardById,
  updateJobCard,
  deleteJobCard
};
