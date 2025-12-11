// Quick test script for Suno API (ESM version)
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Simple .env parser
function loadEnv() {
  try {
    const envFile = readFileSync(join(__dirname, '.env'), 'utf8');
    const env = {};
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=["']?([^"']*)["']?$/);
      if (match) {
        env[match[1].trim()] = match[2].trim();
      }
    });
    return env;
  } catch (err) {
    console.error('❌ Cannot read .env file');
    process.exit(1);
  }
}

async function testSunoAPI() {
  console.log('🧪 Testing Suno API Connection...\n');

  const env = loadEnv();
  const apiKey = env.SUNO_API_KEY;
  const baseURL = env.SUNO_BASE_URL || 'https://api.kie.ai';

  if (!apiKey || apiKey === 'your-suno-api-key-here') {
    console.error('❌ SUNO_API_KEY not configured in .env');
    process.exit(1);
  }

  console.log(`📡 Base URL: ${baseURL}`);
  console.log(`🔑 API Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}\n`);

  try {
    console.log('🔄 Testing API connection...');

    // Try to fetch API info or health check
    const response = await fetch(`${baseURL}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      console.log('✅ API Connection Successful!');
      const data = await response.text();
      console.log('Response:', data.slice(0, 200));
    } else {
      console.log('⚠️  Got response but not OK');
      const error = await response.text();
      console.log('Error:', error);
    }

  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    console.log('\n💡 Tips:');
    console.log('  - Check if the API key is valid');
    console.log('  - Verify base URL:', baseURL);
    console.log('  - Check your internet connection');
  }
}

testSunoAPI();
