# Messaging System Guide

## Overview
The messaging system provides real-time communication capabilities for the KMRL Document Management System with channels, user authentication, and Socket.IO integration.

## Fixed Issues

### 1. Model Reference Inconsistencies
- **Problem**: Models referenced 'user' instead of 'User'
- **Fix**: Updated all model references to use consistent 'User' model name
- **Files**: `messageModel.js`, `channelModel.js`, `userModel.js`

### 2. Authentication Issues
- **Problem**: Missing JWT secret fallback and poor error handling
- **Fix**: Added fallback JWT secret and improved error logging
- **Files**: `index.js`, `messageRoute.js`, `channelRoute.js`

### 3. Frontend API Issues
- **Problem**: Incorrect API endpoints and user ID comparisons
- **Fix**: Fixed endpoint paths and user comparison logic
- **Files**: `messaging.html`, `login.html`, `dashboard.html`

### 4. Socket.IO Authentication
- **Problem**: Missing error handling for socket authentication
- **Fix**: Added proper error logging and fallback handling
- **Files**: `index.js`

## How to Use the Messaging System

### 1. Start the Server
```bash
cd Credentials_Server
npm install
npm start
```

### 2. Access the Application
1. Open `Frontend/index.html` in your browser
2. Click "Login" or navigate to `login.html`
3. Create an account or login with existing credentials
4. Access dashboard and click "New Communication" to open messaging

### 3. Messaging Features

#### Channel Management
- **Create Channel**: Click "+ New Chat" in the sidebar
- **Join Channel**: Automatically added to department channels
- **View Members**: Check right panel for channel member list

#### Sending Messages
- **Basic Message**: Type in input field and press Enter or click send
- **Advanced Message**: Click compose button (📝) for:
  - Message type (text, doc, image, file)
  - Deadline setting
  - Important flag
  - Job card linking

#### Real-time Features
- **Live Updates**: Messages appear instantly via Socket.IO
- **Typing Indicators**: Shows when users are typing
- **Online Status**: Track user presence

### 4. API Endpoints

#### Authentication
- `POST /api/signup` - Create new user account
- `POST /api/login` - User login
- `POST /api/logout` - User logout

#### Channels
- `GET /api/channels` - Get user's channels
- `POST /api/channels` - Create new channel
- `GET /api/channels/:id` - Get channel details
- `PATCH /api/channels/:id` - Update channel
- `DELETE /api/channels/:id` - Delete channel

#### Messages
- `GET /api/messages/channel/:channelId` - Get channel messages
- `POST /api/messages` - Send new message
- `PATCH /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message
- `GET /api/messages/search` - Search messages

### 5. Socket.IO Events

#### Client to Server
- `joinChannel` - Join a channel room
- `leaveChannel` - Leave a channel room
- `sendMessage` - Send message via socket
- `typing` - Send typing indicator

#### Server to Client
- `newMessage` - Receive new message
- `typing` - Receive typing indicator
- `onlineStatus` - User online/offline status

### 6. Testing the System

Run the test script:
```bash
cd SIH25
node testMessaging.js
```

This will:
1. Create a test user
2. Create a test channel
3. Send a test message
4. Retrieve messages

### 7. Environment Variables

Required in `.env`:
```
VITE_MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 8. Security Features

- **JWT Authentication**: All API endpoints protected
- **Channel Access Control**: Users only see department channels
- **Message Permissions**: Only senders can edit/delete messages
- **Role-based Access**: Admin roles have additional permissions

### 9. Troubleshooting

#### Common Issues:
1. **"Channel not found"**: Ensure user is member of the channel
2. **"Unauthorized"**: Check if JWT token is valid and not expired
3. **Socket connection fails**: Verify server is running and CORS is configured
4. **Messages not loading**: Check network tab for API errors

#### Debug Steps:
1. Check browser console for JavaScript errors
2. Verify server logs for backend errors
3. Ensure MongoDB connection is active
4. Test API endpoints with tools like Postman

### 10. Future Enhancements

Potential improvements:
- File upload support for documents/images
- Message reactions and threading
- Push notifications
- Message encryption
- Advanced search and filtering
- Voice/video calling integration

## Architecture

```
Frontend (HTML/JS/CSS)
    ↓ HTTP/WebSocket
Backend (Express.js + Socket.IO)
    ↓ Mongoose ODM
Database (MongoDB)
```

The system uses a RESTful API for standard operations and WebSocket connections for real-time features, ensuring both reliability and responsiveness.