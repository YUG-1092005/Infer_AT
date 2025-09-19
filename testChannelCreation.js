const fetch = require('node-fetch');

async function testCreateChannel() {
  // const url = 'http://localhost:5000/api/channels';
  const url = 'https://credential-5ht0.onrender.com/api/channels';
  const token = 'your_valid_jwt_token_here'; // Replace with a valid JWT token

  const payload = {
    name: 'TestChannel'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error during channel creation:', error);
  }
}

testCreateChannel();
