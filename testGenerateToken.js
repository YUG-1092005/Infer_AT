const fetch = require('node-fetch');

async function testGenerateToken() {
  const url = 'http://localhost:5000/api/token';

  const payload = {
    username: 'testuser',  // Replace with an existing username in your DB
    password: 'testpassword' // Replace with the correct password
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (response.ok && data.token) {
      console.log('Use this token for further API tests:', data.token);
    }
  } catch (error) {
    console.error('Error during token generation:', error);
  }
}

testGenerateToken();
