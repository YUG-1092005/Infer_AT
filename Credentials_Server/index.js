// // server.js
// const express = require("express");
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const cors = require("cors");
// const http = require("http");
// const socketIo = require("socket.io");
// const jwt = require("jsonwebtoken");
// const path = require("path");
// const User = require("./models/userModel");
// const userRoutes = require("./routes/userRoute");
// const channelRoutes = require("./routes/channelRoute");
// const messageRoutes = require("./routes/messageRoute");
// const jobCardRoutes = require("./routes/jobCardRoute");
// const jobRoutes = require("./routes/jobRoute");
// const analyticsRoutes = require("./routes/analyticsRoute");
// const emailRoutes = require("./routes/emailRoute");
// const { sendMessage } = require("./controllers/messageController");
// const { generateToken } = require("./controllers/authController");
// const NetworkDiscovery = require('./networkDiscovery');
// require("dotenv").config();

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   },
//   maxHttpBufferSize: 10e6 // 10MB for socket.io
// });

// // Middleware - Secure CORS configuration
// const allowedOrigins = [
//   'https://infera-official.vercel.app/',
//   'https://credential-5ht0.onrender.com',
//   'http://localhost:3000',
//   'http://localhost:5000',
//   'http://127.0.0.1:5000',
//   'http://localhost:8000',
//   /^http:\/\/192\.168\.[0-9]{1,3}\.[0-9]{1,3}:5000$/,
//   /^http:\/\/10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}:5000$/
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
    
//     const isAllowed = allowedOrigins.some(allowed => {
//       if (typeof allowed === 'string') return allowed === origin;
//       return allowed.test(origin);
//     });
    
//     if (isAllowed) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

// // Add static file serving for frontend
// app.use(express.static('../Frontend'));
// // Increase payload limits for file uploads
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// //App routes
// app.use("/api", userRoutes);
// app.use("/api/channels", channelRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/jobcards", jobCardRoutes);
// app.use("/api/jobs", jobRoutes);
// app.use("/api/analytics", analyticsRoutes);
// app.use("/api/email", emailRoutes);

// console.log('✅ Routes loaded: /api, /api/channels, /api/messages, /api/jobcards, /api/jobs, /api/analytics');
// console.log('✅ Analytics endpoints: /api/analytics/track, /api/analytics/realtime, /api/analytics/ocr, /api/analytics/dashboard');
// console.log('✅ Email endpoints: /api/email/invite, /api/email/join/:token');

// // MongoDB connection
// const MONGO_URI = process.env.VITE_MONGO_URL;
// mongoose
//   .connect(MONGO_URI, {
//     serverSelectionTimeoutMS: 5000,
//     socketTimeoutMS: 45000,
//   })
//   .then(() => console.log("MongoDB connected successfully"))
//   .catch((err) => {
//     console.error("MongoDB connection error:", err);
//     process.exit(1);
//   });

// // Basic route - serve frontend
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, '../Frontend/index.html'));
// });

// // Health check
// app.get("/health", (req, res) => {
//   res.json({ status: "OK", message: "KMRL Server is running!", timestamp: new Date().toISOString() });
// });

// // Test registration endpoint
// app.get("/api/test", (req, res) => {
//   res.json({ message: "API is working!", server: "KMRL", timestamp: new Date().toISOString() });
// });

// // Signup route is handled in userRoutes

// // JWT authentication middleware for socket.io
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) {
//     return next(new Error("Authentication error: Token required"));
//   }
//   const jwtSecret = process.env.JWT_SECRET;
//   if (!jwtSecret) {
//     return next(new Error("JWT_SECRET not configured"));
//   }
//   jwt.verify(token, jwtSecret, (err, decoded) => {
//     if (err) {
//       console.error('Socket auth error:', err);
//       return next(new Error("Authentication error: Invalid token"));
//     }
//     socket.user = decoded;
//     next();
//   });
// });

// // Socket.IO logic
// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id, 'UserID:', socket.user.id);

//   // Join channel room
//   socket.on('joinChannel', (channelId) => {
//     socket.join(channelId);
//     console.log(`User ${socket.id} joined channel ${channelId}`);
//   });

//   // Leave channel room
//   socket.on('leaveChannel', (channelId) => {
//     socket.leave(channelId);
//     console.log(`User ${socket.id} left channel ${channelId}`);
//   });

//   // Handle new message
//   socket.on('sendMessage', async (data) => {
//     try {
//       const { channelId, content, type, flags, deadline, jobCardId } = data;
//       const senderId = socket.user.id;

//       // Use controller to save message and emit event
//       const newMessage = await sendMessageSocket(channelId, senderId, content, type, flags, deadline, jobCardId);

//       // Emit to all users in the channel
//       io.to(channelId).emit('newMessage', newMessage);
      
//       // Also emit to all connected users for channel list updates
//       io.emit('channelUpdated', { channelId, lastMessage: newMessage });
//     } catch (error) {
//       console.error('Error sending message via socket:', error);
//     }
//   });

//   // Handle channel creation broadcast
//   socket.on('channelCreated', (data) => {
//     console.log('Broadcasting channel created:', data);
//     socket.broadcast.emit('channelCreated', data);
//   });

//   // Typing indicator event
//   socket.on('typing', (data) => {
//     const { channelId, isTyping } = data;
//     socket.to(channelId).emit('typing', { userId: socket.user.id, isTyping });
//   });

//   // Online status event
//   socket.on('onlineStatus', (status) => {
//     io.emit('onlineStatus', { userId: socket.user.id, status });
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });
// });

// // Helper function to save message via controller logic for socket
// async function sendMessageSocket(channelId, senderId, content, type = 'text', flags = { important: false }, deadline, jobCardId) {
//   const Message = require('./models/messageModel');
//   const Channel = require('./models/channelModel');

//   // Check if channel exists and sender is member
//   const channel = await Channel.findById(channelId);
//   if (!channel) throw new Error('Channel not found');
//   if (!channel.members.some(member => member.toString() === senderId)) {
//     throw new Error('Access denied');
//   }

//   // Ensure flags is an object
//   const messageFlags = typeof flags === 'object' && flags !== null ? flags : { important: false };

//   const newMessage = new Message({
//     channelId,
//     senderId,
//     content,
//     type,
//     flags: messageFlags,
//     deadline: deadline ? new Date(deadline) : null,
//     jobCardId
//   });

//   await newMessage.save();

//   await newMessage.populate('senderId', 'fullName username');

//   return newMessage;
// }

// // Get all available IP addresses
// function getAllIPs() {
//   const { networkInterfaces } = require('os');
//   const nets = networkInterfaces();
//   const ips = [];
  
//   for (const name of Object.keys(nets)) {
//     for (const net of nets[name]) {
//       if (net.family === 'IPv4' && !net.internal) {
//         ips.push({ interface: name, ip: net.address });
//       }
//     }
//   }
//   return ips;
// }

// // Display current network status
// function displayNetworkStatus() {
//   const ips = getAllIPs();
//   console.log('\n🌐 === KMRL SERVER NETWORK STATUS ===');
//   console.log(`✅ Server running on port: ${PORT}`);
//   console.log(`🏠 Local access: http://localhost:${PORT}`);
//   console.log(`🔗 Server binding: 0.0.0.0:${PORT} (all interfaces)`);
  
//   if (ips.length === 0) {
//     console.log('❌ No network connections detected');
//     console.log('⚠️  Check your network connection!');
//   } else {
//     console.log('\n📡 Network Access URLs (share with others):');
//     ips.forEach(({ interface, ip }) => {
//       console.log(`   ${interface}: http://${ip}:${PORT}`);
//     });
//     console.log('\n📱 Mobile/Other devices can use any of the above URLs');
//   }
  
//   // Test localhost connectivity
//   setTimeout(async () => {
//     try {
//       const http = require('http');
//       const req = http.get('http://localhost:' + PORT + '/health', (res) => {
//         console.log('✅ Localhost test: Server responding');
//       });
//       req.on('error', (err) => {
//         console.log('❌ Localhost test failed:', err.message);
//       });
//       req.setTimeout(2000);
//     } catch (e) {
//       console.log('❌ Localhost test error:', e.message);
//     }
//   }, 1000);
  
//   console.log('\n🔗 To connect multiple users:');
//   console.log('   1. Share one of the network URLs above');
//   console.log('   2. Others open that URL in their browser');
//   console.log('   3. Register/Login normally');
//   console.log('   4. Start chatting!');
//   console.log('\n==========================================\n');
// }

// // Monitor network changes
// function monitorNetworkChanges() {
//   const os = require('os');
//   let lastIPs = JSON.stringify(getAllIPs());
  
//   setInterval(() => {
//     const currentIPs = JSON.stringify(getAllIPs());
//     if (currentIPs !== lastIPs) {
//       console.log('\n🔄 Network change detected!');
//       displayNetworkStatus();
//       lastIPs = currentIPs;
//     }
//   }, 3000); // Check every 3 seconds
// }

// // Start server
// const PORT = process.env.PORT || 5000;

// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`\n🚀 Server started successfully!`);
//   console.log(`📍 Listening on all network interfaces (0.0.0.0:${PORT})`);
//   displayNetworkStatus();
//   monitorNetworkChanges();
  
//   // Start network discovery (with error handling)
//   try {
//     const discovery = new NetworkDiscovery(PORT);
//     discovery.startBroadcast();
//   } catch (error) {
//     console.log('Network discovery disabled (non-critical)');
//   }
// });

// // Make io available globally
// global.io = io;
// module.exports = { io, app, server };



// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const path = require("path");
const userRoutes = require("./routes/userRoute");
const channelRoutes = require("./routes/channelRoute");
const messageRoutes = require("./routes/messageRoute");
const jobCardRoutes = require("./routes/jobCardRoute");
const jobRoutes = require("./routes/jobRoute");
const analyticsRoutes = require("./routes/analyticsRoute");
const emailRoutes = require("./routes/emailRoute");
const { sendMessage } = require("./controllers/messageController");
const NetworkDiscovery = require('./networkDiscovery');
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// --- SOCKET.IO SETUP ---
const io = socketIo(server, {
  cors: {
    origin: [
      'https://inferat-official.vercel.app/',
      'https://credential-5ht0.onrender.com'
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  maxHttpBufferSize: 10e6
});

// --- CORS MIDDLEWARE ---
const allowedOrigins = [
  'https://inferat-official.vercel.app/',
  'https://credential-5ht0.onrender.com',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));

// --- BODY PARSERS ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- STATIC FRONTEND ---
app.use(express.static(path.join(__dirname, '../Frontend')));

// --- ROUTES ---
app.use("/api", userRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/jobcards", jobCardRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/email", emailRoutes);

// --- BASIC ROUTES ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running!", timestamp: new Date().toISOString() });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!", server: "KMRL", timestamp: new Date().toISOString() });
});

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.VITE_MONGO_URL, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

// --- SOCKET.IO AUTH ---
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error: Token required"));
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return next(new Error("JWT_SECRET not configured"));

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) return next(new Error("Authentication error: Invalid token"));
    socket.user = decoded;
    next();
  });
});

// --- SOCKET.IO EVENTS ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'UserID:', socket.user.id);

  socket.on('joinChannel', (channelId) => socket.join(channelId));
  socket.on('leaveChannel', (channelId) => socket.leave(channelId));

  socket.on('sendMessage', async (data) => {
    try {
      const { channelId, content, type, flags, deadline, jobCardId } = data;
      const newMessage = await sendMessageSocket(channelId, socket.user.id, content, type, flags, deadline, jobCardId);
      io.to(channelId).emit('newMessage', newMessage);
      io.emit('channelUpdated', { channelId, lastMessage: newMessage });
    } catch (error) {
      console.error('Error sending message via socket:', error);
    }
  });

  socket.on('channelCreated', (data) => socket.broadcast.emit('channelCreated', data));
  socket.on('typing', (data) => {
    const { channelId, isTyping } = data;
    socket.to(channelId).emit('typing', { userId: socket.user.id, isTyping });
  });
  socket.on('onlineStatus', (status) => io.emit('onlineStatus', { userId: socket.user.id, status }));

  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

// --- HELPER FUNCTION ---
async function sendMessageSocket(channelId, senderId, content, type = 'text', flags = { important: false }, deadline, jobCardId) {
  const Message = require('./models/messageModel');
  const Channel = require('./models/channelModel');

  const channel = await Channel.findById(channelId);
  if (!channel) throw new Error('Channel not found');
  if (!channel.members.some(member => member.toString() === senderId)) throw new Error('Access denied');

  const newMessage = new Message({
    channelId, senderId, content, type,
    flags: typeof flags === 'object' ? flags : { important: false },
    deadline: deadline ? new Date(deadline) : null,
    jobCardId
  });

  await newMessage.save();
  await newMessage.populate('senderId', 'fullName username');
  return newMessage;
}

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Make io available globally
global.io = io;
module.exports = { io, app, server };
