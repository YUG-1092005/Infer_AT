// Test script to verify jobs API
const fetch = require('node-fetch');

async function testJobsAPI() {
  try {
    // Test health endpoint first
    console.log('Testing server health...');
    const healthRes = await fetch('http://10.13.123.182:5000/health');
    if (healthRes.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server not responding');
      return;
    }

    // Test jobs endpoint (should return 401 without token)
    console.log('Testing jobs endpoint...');
    const jobsRes = await fetch('http://10.13.123.182:5000/api/jobs');
    console.log('Jobs endpoint status:', jobsRes.status);
    
    if (jobsRes.status === 401) {
      console.log('✅ Jobs API endpoint exists (returns 401 - needs auth)');
    } else if (jobsRes.status === 404) {
      console.log('❌ Jobs API endpoint not found - server needs restart');
    } else {
      console.log('⚠️ Unexpected response:', jobsRes.status);
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testJobsAPI();