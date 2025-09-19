const fetch = require('node-fetch');

const API_BASE = "http://localhost:5000/api";

async function testMessaging() {
  try {
    console.log("Testing messaging system...");
    
    // Test 1: Create a test user
    console.log("\n1. Creating test user...");
    const signupRes = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        department: "Engineering",
        role: "officer"
      })
    });
    
    const signupData = await signupRes.json();
    console.log("Signup result:", signupData);
    
    if (!signupRes.ok) {
      console.error("Signup failed:", signupData);
      return;
    }
    
    const token = signupData.token;
    const userId = signupData.user._id;
    
    // Test 2: Create a channel
    console.log("\n2. Creating test channel...");
    const channelRes = await fetch(`${API_BASE}/channels`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: "Test Channel"
      })
    });
    
    const channelData = await channelRes.json();
    console.log("Channel creation result:", channelData);
    
    if (!channelRes.ok) {
      console.error("Channel creation failed:", channelData);
      return;
    }
    
    const channelId = channelData.channel._id;
    
    // Test 3: Send a message
    console.log("\n3. Sending test message...");
    const messageRes = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        channelId: channelId,
        content: "Hello, this is a test message!",
        type: "text"
      })
    });
    
    const messageData = await messageRes.json();
    console.log("Message send result:", messageData);
    
    // Test 4: Get messages
    console.log("\n4. Retrieving messages...");
    const getMessagesRes = await fetch(`${API_BASE}/messages/channel/${channelId}`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    
    const messagesData = await getMessagesRes.json();
    console.log("Messages retrieved:", messagesData);
    
    console.log("\n✅ Messaging system test completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testMessaging();