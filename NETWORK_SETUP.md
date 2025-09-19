# 🌐 Local Network Setup Guide

## 🎯 How to Connect Multiple Users on Same WiFi

### **Step 1: Start Server on One Computer**
```bash
cd SIH25/Credentials_Server
npm start
```

### **Step 2: Find Your IP Address**

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig
```
Look for "inet" address

### **Step 3: Share Your IP with Others**
Tell other users your IP address (e.g., 192.168.1.100)

### **Step 4: Others Connect to Your Server**
Other users open browser and go to:
```
http://YOUR_IP_ADDRESS:5000
```
Example: `http://192.168.1.100:5000`

## 🚀 Quick Demo Setup

### **Host Computer (Server):**
1. Run `npm start` in Credentials_Server folder
2. Note your IP address from console output
3. Share IP with others

### **Client Computers:**
1. Open browser
2. Go to `http://HOST_IP:5000`
3. Register/Login normally
4. Join channels and chat!

## ✅ Verification Steps

1. **Server shows**: "Server running on port: 5000"
2. **Network IPs listed**: Shows all available network addresses
3. **Others can access**: Browser loads the homepage
4. **Users can register**: Create accounts normally
5. **Channels work**: Create, join, and message in channels

## 🔧 Troubleshooting

### **Can't Connect?**
- Check firewall settings
- Ensure both devices on same WiFi
- Try different IP addresses shown in server console

### **Server Not Starting?**
- Check if port 5000 is free
- Install dependencies: `npm install`
- Check MongoDB connection

### **No Channels Visible?**
- Both users must be registered
- Refresh the page
- Check browser console for errors

## 📱 Mobile Access
Mobile devices on same WiFi can also access:
```
http://HOST_IP:5000
```

## 🎉 Ready to Use!
Once connected, all features work:
- ✅ User registration/login
- ✅ Channel creation/joining
- ✅ Real-time messaging
- ✅ Job card management
- ✅ File sharing