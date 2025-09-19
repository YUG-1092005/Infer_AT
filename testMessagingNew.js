const https = require('https');
const http = require('http');

const API_BASE = "http://localhost:5000/api";

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ ok: res.statusCode < 400, status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ ok: res.statusCode < 400, status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testMessaging() {
  try {
    console.log("Testing messaging system...");
    
    const timestamp = Date.now();
    
    // Test 1: Create a test user with unique credentials
    console.log("\n1. Creating test user...");
    const signupRes = await makeRequest(`${API_BASE}/signup`, {
      method: 'POST',
      body: {
        fullName: `Test User ${timestamp}`,
        username: `testuser${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: "password123",
        department: "Engineering",
        role: "officer"
      }
    });
    
    console.log("Signup result:", signupRes.data);
    
    if (!signupRes.ok) {
      console.error("Signup failed:", signupRes.data);
      return;
    }
    
    const token = signupRes.data.token;
    const userId = signupRes.data.user._id;
    
    // Test 2: Create a channel
    console.log("\n2. Creating test channel...");
    const channelRes = await makeRequest(`${API_BASE}/channels`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: {
        name: `Test Channel ${timestamp}`
      }
    });
    
    console.log("Channel creation result:", channelRes.data);
    
    if (!channelRes.ok) {
      console.error("Channel creation failed:", channelRes.data);
      return;
    }
    
    const channelId = channelRes.data.channel._id;
    
    // Test 3: Send a message
    console.log("\n3. Sending test message...");
    const messageRes = await makeRequest(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: {
        channelId: channelId,
        content: "Hello, this is a test message!",
        type: "text"
      }
    });
    
    console.log("Message send result:", messageRes.data);
    
    // Test 4: Get messages
    console.log("\n4. Retrieving messages...");
    const getMessagesRes = await makeRequest(`${API_BASE}/messages/channel/${channelId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log("Messages retrieved:", getMessagesRes.data);
    
    // Test 5: Get channels
    console.log("\n5. Getting user channels...");
    const getChannelsRes = await makeRequest(`${API_BASE}/channels`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log("Channels retrieved:", getChannelsRes.data);
    
    console.log("\n✅ Messaging system test completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testMessaging();