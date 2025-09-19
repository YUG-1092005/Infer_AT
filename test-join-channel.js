const fetch = require('node-fetch');

async function testJoinChannel() {
  try {
    // Test if server is running
    // const healthCheck = await fetch('http://localhost:5000/');
    const healthCheck = await fetch('https://credential-5ht0.onrender.com');
    console.log('Server health check:', healthCheck.status);
    
    // Test the join route (this will fail without auth, but should return 401, not 404)
    // const joinTest = await fetch('http://localhost:5000/api/channels/test123/join', {
    const joinTest = await fetch('https://credential-5ht0.onrender.com/api/channels/test123/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Join route test status:', joinTest.status);
    const response = await joinTest.text();
    console.log('Join route response:', response);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testJoinChannel();