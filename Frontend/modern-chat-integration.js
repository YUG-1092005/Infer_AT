/**
 * Modern Chat Integration
 * Connects the beautiful UI with the existing backend system
 */

class ModernChatApp {
  constructor() {
    this.API_BASE = "https://credential-5ht0.onrender.com/api";
    this.socket = null;
    this.currentUser = null;
    this.currentChannelId = null;
    this.channels = [];
    this.messages = [];
    this.typingUsers = new Set();
    
    this.init();
  }

  async init() {
    try {
      await this.initializeServer();
      await this.loadUser();
      this.initializeSocket();
      this.setupEventListeners();
      await this.loadChannels();
      this.startPeriodicUpdates();
    } catch (error) {
      console.error('Failed to initialize chat app:', error);
      this.showToast('Failed to connect to server', 'error');
    }
  }

  async initializeServer() {
    try {
      // const testRes = await fetch('http://10.13.123.182:5000/health');
      const testRes = await fetch('https://credential-5ht0.onrender.com/health');
      if (testRes.ok) {
        // this.API_BASE = 'http://10.13.123.182:5000/api';
        this.API_BASE = 'https://credential-5ht0.onrender.com/api';
        // window.KMRL_SERVER = 'http://10.13.123.182:5000';
        window.KMRL_SERVER = 'https://credential-5ht0.onrender.com';
        console.log('Connected to network server:', this.API_BASE);
      }
    } catch (e) {
      console.log('Using localhost server');
      // window.KMRL_SERVER = 'http://localhost:5000';
      window.KMRL_SERVER = 'https://credential-5ht0.onrender.com';
    }
  }

  async loadUser() {
    const params = new URLSearchParams(location.search);
    const userId = params.get("id") || localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    
    if (!token || !userId) {
      this.showToast('Please login to continue', 'error');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      return;
    }

    try {
      const res = await fetch(`${this.API_BASE}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      this.currentUser = data.user || data;
      
      // Update UI with user info
      this.updateUserInterface();
      
    } catch (error) {
      console.error("Error loading user:", error);
      this.showToast('Failed to load user data', 'error');
    }
  }

  initializeSocket() {
    const token = localStorage.getItem("token");
    // this.socket = io(window.KMRL_SERVER || "http://localhost:5000", { 
    //   auth: { token } 
    // });
    this.socket = io(window.KMRL_SERVER || "https://credential-5ht0.onrender.com", { 
      auth: { token } 
    });

    // Socket event listeners
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.showToast('Connected to server', 'success');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.showToast('Disconnected from server', 'warning');
    });

    this.socket.on('newMessage', (message) => {
      this.handleNewMessage(message);
    });

    this.socket.on('userTyping', (data) => {
      this.handleUserTyping(data);
    });

    this.socket.on('userStoppedTyping', (data) => {
      this.handleUserStoppedTyping(data);
    });

    this.socket.on('channelCreated', (channel) => {
      this.handleChannelCreated(channel);
    });

    this.socket.on('userJoinedChannel', (data) => {
      this.handleUserJoinedChannel(data);
    });

    this.socket.on('userLeftChannel', (data) => {
      this.handleUserLeftChannel(data);
    });
  }

  setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleTheme.bind(this));
    }

    // Message input
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (messageInput) {
      messageInput.addEventListener('input', this.handleInputChange.bind(this));
      messageInput.addEventListener('keypress', this.handleKeyPress.bind(this));
    }
    
    if (sendBtn) {
      sendBtn.addEventListener('click', this.sendMessage.bind(this));
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', this.handleSearch.bind(this));
    }

    // New chat button
    const newChatBtn = document.getElementById('newChatBtn');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', this.showNewChatModal.bind(this));
    }
  }

  async loadChannels() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${this.API_BASE}/channels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      this.channels = data.channels || [];
      this.renderChannels();
      
    } catch (error) {
      console.error("Error loading channels:", error);
      this.showToast('Failed to load channels', 'error');
    }
  }

  renderChannels() {
    const channelsList = document.getElementById('channelsList');
    if (!channelsList) return;

    channelsList.innerHTML = '';

    this.channels.forEach((channel, index) => {
      const channelElement = this.createChannelElement(channel, index === 0);
      channelsList.appendChild(channelElement);
    });
  }

  createChannelElement(channel, isActive = false) {
    const div = document.createElement('div');
    div.className = `channel-item ${isActive ? 'active' : ''}`;
    div.dataset.channelId = channel._id;
    
    const lastMessage = channel.lastMessage || {};
    const unreadCount = channel.unreadCount || 0;
    
    div.innerHTML = `
      <div class="channel-content">
        <div class="channel-avatar" style="background: ${this.getChannelGradient(channel.name)}">${channel.name.charAt(0).toUpperCase()}</div>
        <div class="channel-info">
          <div class="channel-name">${channel.name}</div>
          <div class="channel-preview">${this.formatLastMessage(lastMessage)}</div>
        </div>
        <div class="channel-meta">
          <div class="channel-time">${this.formatTime(lastMessage.timestamp)}</div>
          ${unreadCount > 0 ? `<div class="unread-badge">${unreadCount}</div>` : ''}
        </div>
      </div>
    `;

    div.addEventListener('click', () => this.selectChannel(channel));
    
    return div;
  }

  getChannelGradient(name) {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    ];
    
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return gradients[Math.abs(hash) % gradients.length];
  }

  formatLastMessage(message) {
    if (!message || !message.content) return 'No messages yet';
    
    const content = message.content.length > 50 
      ? message.content.substring(0, 50) + '...' 
      : message.content;
    
    const sender = message.senderId?.fullName || 'Someone';
    return `${sender}: ${content}`;
  }

  formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    return date.toLocaleDateString();
  }

  async selectChannel(channel) {
    // Update UI
    document.querySelectorAll('.channel-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const channelElement = document.querySelector(`[data-channel-id="${channel._id}"]`);
    if (channelElement) {
      channelElement.classList.add('active');
    }

    // Update chat header
    this.updateChatHeader(channel);
    
    // Join channel via socket
    this.socket.emit('joinChannel', channel._id);
    this.currentChannelId = channel._id;
    
    // Load messages
    await this.loadMessages(channel._id);
    
    // Load channel members
    await this.loadChannelMembers(channel._id);
  }

  updateChatHeader(channel) {
    const chatAvatar = document.querySelector('.chat-avatar');
    const chatTitle = document.querySelector('.chat-details h3');
    const chatStatus = document.querySelector('.chat-status span');
    
    if (chatAvatar) {
      chatAvatar.textContent = channel.name.charAt(0).toUpperCase();
      chatAvatar.style.background = this.getChannelGradient(channel.name);
    }
    
    if (chatTitle) {
      chatTitle.textContent = channel.name;
    }
    
    if (chatStatus) {
      const memberCount = channel.members?.length || 0;
      chatStatus.textContent = `${memberCount} members`;
    }
  }

  async loadMessages(channelId) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${this.API_BASE}/messages/channel/${channelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      this.messages = data.messages || [];
      this.renderMessages();
      
    } catch (error) {
      console.error("Error loading messages:", error);
      this.showToast('Failed to load messages', 'error');
    }
  }

  renderMessages() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;

    // Clear existing messages (keep typing indicator if present)
    const typingIndicator = messagesContainer.querySelector('.typing-indicator');
    messagesContainer.innerHTML = '';

    this.messages.forEach(message => {
      const messageElement = this.createMessageElement(message);
      messagesContainer.appendChild(messageElement);
    });

    // Re-add typing indicator if it existed
    if (typingIndicator) {
      messagesContainer.appendChild(typingIndicator);
    }

    this.scrollToBottom();
  }

  createMessageElement(message) {
    const div = document.createElement('div');
    const isSent = message.senderId._id === this.currentUser._id;
    
    let messageClass = `message ${isSent ? 'sent' : 'received'}`;
    
    // Add special classes for message types
    if (message.type === 'urgent' || message.priority === 'urgent') {
      messageClass += ' urgent';
    } else if (message.type === 'jobcard') {
      messageClass += ' jobcard';
    }
    
    div.className = messageClass;
    
    let messageHTML = '';
    
    // Add sender name for received messages
    if (!isSent && message.senderId.fullName) {
      messageHTML += `<div class="message-sender">${message.senderId.fullName}</div>`;
    }
    
    // Message bubble
    messageHTML += `
      <div class="message-bubble" data-message-id="${message._id}">
        ${this.formatMessageContent(message)}
        ${this.renderMessageReactions(message)}
      </div>
      <div class="message-time">${this.formatTime(message.timestamp)}</div>
    `;
    
    div.innerHTML = messageHTML;
    
    // Add click handler for message interactions
    div.addEventListener('click', () => this.handleMessageClick(message));
    
    return div;
  }

  formatMessageContent(message) {
    let content = message.content;
    
    // Handle different message types
    if (message.type === 'urgent') {
      content = `🚨 ${content}`;
    } else if (message.type === 'jobcard') {
      content = `📋 ${content}`;
    }
    
    // Format mentions
    if (message.mentions && message.mentions.length > 0) {
      message.mentions.forEach(mention => {
        const mentionRegex = new RegExp(`@${mention.username}`, 'gi');
        content = content.replace(mentionRegex, `<span class="mention">@${mention.fullName}</span>`);
      });
    }
    
    // Format basic markdown
    content = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
    
    return content;
  }

  renderMessageReactions(message) {
    if (!message.reactions || message.reactions.length === 0) {
      return '';
    }
    
    const reactionGroups = {};
    message.reactions.forEach(reaction => {
      if (!reactionGroups[reaction.emoji]) {
        reactionGroups[reaction.emoji] = [];
      }
      reactionGroups[reaction.emoji].push(reaction);
    });
    
    let reactionsHTML = '<div class="message-reactions">';
    Object.entries(reactionGroups).forEach(([emoji, reactions]) => {
      const hasUserReaction = reactions.some(r => r.userId === this.currentUser._id);
      reactionsHTML += `
        <span class="reaction ${hasUserReaction ? 'user-reacted' : ''}" 
              data-emoji="${emoji}" 
              onclick="window.chatApp.toggleReaction('${message._id}', '${emoji}')">
          ${emoji} ${reactions.length}
        </span>
      `;
    });
    reactionsHTML += '</div>';
    
    return reactionsHTML;
  }

  async sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();
    
    if (!content || !this.currentChannelId) return;

    try {
      const token = localStorage.getItem("token");
      const messageData = {
        channelId: this.currentChannelId,
        content: content,
        type: 'text',
        priority: 'normal'
      };

      const res = await fetch(`${this.API_BASE}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      // Clear input
      messageInput.value = '';
      messageInput.style.height = 'auto';
      
      // Stop typing indicator
      this.socket.emit('stopTyping', { channelId: this.currentChannelId });
      
      this.showToast('Message sent!', 'success');
      
    } catch (error) {
      console.error("Error sending message:", error);
      this.showToast('Failed to send message', 'error');
    }
  }

  handleNewMessage(message) {
    if (message.channelId === this.currentChannelId) {
      this.messages.push(message);
      
      // Remove typing indicator if it's from the same user
      this.removeTypingIndicator(message.senderId._id);
      
      // Add message to UI
      const messageElement = this.createMessageElement(message);
      const messagesContainer = document.getElementById('messagesContainer');
      
      // Insert before typing indicator if present
      const typingIndicator = messagesContainer.querySelector('.typing-indicator');
      if (typingIndicator) {
        messagesContainer.insertBefore(messageElement, typingIndicator);
      } else {
        messagesContainer.appendChild(messageElement);
      }
      
      this.scrollToBottom();
      
      // Show notification if not from current user
      if (message.senderId._id !== this.currentUser._id) {
        this.showToast(`New message from ${message.senderId.fullName}`, 'success');
      }
    }
    
    // Update channel list
    this.updateChannelLastMessage(message);
  }

  handleUserTyping(data) {
    if (data.channelId === this.currentChannelId && data.userId !== this.currentUser._id) {
      this.typingUsers.add(data.userId);
      this.updateTypingIndicator();
    }
  }

  handleUserStoppedTyping(data) {
    if (data.channelId === this.currentChannelId) {
      this.typingUsers.delete(data.userId);
      this.updateTypingIndicator();
    }
  }

  updateTypingIndicator() {
    const messagesContainer = document.getElementById('messagesContainer');
    let typingIndicator = messagesContainer.querySelector('.typing-indicator');
    
    if (this.typingUsers.size === 0) {
      if (typingIndicator) {
        typingIndicator.remove();
      }
      return;
    }
    
    if (!typingIndicator) {
      typingIndicator = document.createElement('div');
      typingIndicator.className = 'typing-indicator';
      messagesContainer.appendChild(typingIndicator);
    }
    
    const userCount = this.typingUsers.size;
    const typingText = userCount === 1 
      ? 'Someone is typing...' 
      : `${userCount} people are typing...`;
    
    typingIndicator.innerHTML = `
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
      <span style="font-size: 12px; color: var(--text-muted); margin-left: 4px;">${typingText}</span>
    `;
    
    this.scrollToBottom();
  }

  removeTypingIndicator(userId) {
    this.typingUsers.delete(userId);
    this.updateTypingIndicator();
  }

  handleInputChange(e) {
    const content = e.target.value;
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    
    // Handle typing indicators
    if (content.trim() && this.currentChannelId) {
      this.socket.emit('typing', { channelId: this.currentChannelId });
    } else {
      this.socket.emit('stopTyping', { channelId: this.currentChannelId });
    }
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const channelItems = document.querySelectorAll('.channel-item');
    
    channelItems.forEach(item => {
      const channelName = item.querySelector('.channel-name').textContent.toLowerCase();
      const preview = item.querySelector('.channel-preview').textContent.toLowerCase();
      
      if (channelName.includes(query) || preview.includes(query)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme icons
    const themeIcons = document.querySelectorAll('.theme-icon');
    themeIcons.forEach(icon => {
      icon.classList.toggle('active', icon.getAttribute('data-theme') === newTheme);
    });
    
    this.showToast(`Switched to ${newTheme} mode`, 'success');
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
      toastMessage.textContent = message;
      toast.className = `toast ${type} show`;
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
  }

  updateUserInterface() {
    // Update any user-specific UI elements
    if (this.currentUser) {
      document.title = `Infer@ — ${this.currentUser.fullName || this.currentUser.username}`;
    }
  }

  startPeriodicUpdates() {
    // Refresh channels every 30 seconds
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.loadChannels();
      }
    }, 30000);
    
    // Refresh when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.loadChannels();
        if (this.currentChannelId) {
          this.loadMessages(this.currentChannelId);
        }
      }
    });
  }

  // Additional methods for enhanced functionality
  async toggleReaction(messageId, emoji) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${this.API_BASE}/messages/${messageId}/reaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emoji }),
      });

      if (res.ok) {
        // Refresh messages to show updated reactions
        await this.loadMessages(this.currentChannelId);
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
    }
  }

  async loadChannelMembers(channelId) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${this.API_BASE}/channels/${channelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        this.renderChannelMembers(data.channel.members);
      }
    } catch (error) {
      console.error("Error loading channel members:", error);
    }
  }

  renderChannelMembers(members) {
    const membersList = document.querySelector('.members-list');
    if (!membersList || !members) return;

    membersList.innerHTML = '';
    
    members.forEach(member => {
      const memberElement = document.createElement('div');
      memberElement.className = 'member-item';
      memberElement.innerHTML = `
        <div class="member-avatar">${member.fullName.charAt(0).toUpperCase()}</div>
        <div class="member-info">
          <div class="member-name">${member.fullName}</div>
          <div class="member-status">
            <div class="member-status-dot"></div>
            <span>Online</span>
          </div>
        </div>
      `;
      membersList.appendChild(memberElement);
    });
  }

  handleMessageClick(message) {
    // Handle message interactions (reactions, replies, etc.)
    console.log('Message clicked:', message);
  }

  showNewChatModal() {
    this.showToast('New chat feature coming soon!', 'success');
  }

  updateChannelLastMessage(message) {
    // Update the channel list with the latest message
    const channelElement = document.querySelector(`[data-channel-id="${message.channelId}"]`);
    if (channelElement) {
      const preview = channelElement.querySelector('.channel-preview');
      const time = channelElement.querySelector('.channel-time');
      
      if (preview) {
        const senderName = message.senderId.fullName || 'Someone';
        const content = message.content.length > 50 
          ? message.content.substring(0, 50) + '...' 
          : message.content;
        preview.textContent = `${senderName}: ${content}`;
      }
      
      if (time) {
        time.textContent = this.formatTime(message.timestamp);
      }
    }
  }
}

// Initialize the chat app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.chatApp = new ModernChatApp();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModernChatApp;
}