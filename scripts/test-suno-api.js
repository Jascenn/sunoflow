// Quick test script for Suno API
const axios = require('axios');
require('dotenv').config();

async function testSunoAPI() {
  console.log('🧪 Testing Suno API Connection...\n');

  const apiKey = process.env.SUNO_API_KEY;
  const baseURL = process.env.SUNO_BASE_URL;

  if (!apiKey || apiKey === 'your-suno-api-key-here') {
    console.error('❌ SUNO_API_KEY not configured in .env');
    process.exit(1);
  }

  console.log(`📡 Base URL: ${baseURL}`);
  console.log(`🔑 API Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}\n`);

  try {
    // Try a simple API call (adjust endpoint based on Kie.ai docs)
    console.log('🔄 Making test request...');

    const response = await axios.get(`${baseURL}/health`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      timeout: 10000,
    });

    console.log('✅ API Connection Successful!');
    console.log('Response:', response.data);

  } catch (error) {
    if (error.response) {
      console.error(`❌ API Error: ${error.response.status} ${error.response.statusText}`);
      console.error('Details:', error.response.data);
    } else if (error.request) {
      console.error('❌ No response received from API');
      console.error('Check if the base URL is correct:', baseURL);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testSunoAPI();
