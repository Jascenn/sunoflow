/**
 * Test script to verify Suno API integration
 * Run with: npx tsx test-suno-api.ts
 */

import { getSunoClient } from '../lib/suno-client';

// Environment variables are loaded from .env file automatically

async function testSunoAPI() {
  console.log('🧪 Testing Suno API Integration\n');

  try {
    // 1. Test Client Initialization
    console.log('1️⃣  Initializing Suno Client...');
    const client = getSunoClient();
    console.log('✅ Client initialized successfully\n');

    // 2. Test Music Generation
    console.log('2️⃣  Testing Music Generation...');
    const taskId = await client.generate({
      prompt: 'A cheerful acoustic guitar melody with upbeat percussion',
      tags: 'acoustic, upbeat, folk',
      title: 'API Test Song',
      instrumental: false,
    });
    console.log('✅ Generation request successful!');
    console.log(`   Task ID: ${taskId}\n`);

    // 3. Test Status Query
    console.log('3️⃣  Testing Status Query...');
    const status = await client.getStatus(taskId);
    console.log('✅ Status query successful!');
    console.log(`   Status: ${status.status}`);
    console.log(`   Task ID: ${status.taskId}`);
    if (status.response?.title) console.log(`   Title: ${status.response.title}`);
    if (status.response?.audio_url) console.log(`   Audio URL: ${status.response.audio_url}`);
    if (status.response?.image_url) console.log(`   Image URL: ${status.response.image_url}`);
    if (status.response?.duration) console.log(`   Duration: ${status.response.duration}s`);
    console.log();

    // 4. Poll for completion (max 5 times)
    console.log('4️⃣  Polling for completion (max 30 seconds)...');
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 6000)); // Wait 6 seconds
      attempts++;

      const currentStatus = await client.getStatus(taskId);
      console.log(`   Attempt ${attempts}/${maxAttempts}: ${currentStatus.status}`);

      if (currentStatus.status === 'SUCCESS' || currentStatus.status === 'FIRST_SUCCESS') {
        console.log('✅ Task completed successfully!');
        if (currentStatus.response?.audio_url) {
          console.log(`   Audio URL: ${currentStatus.response.audio_url}`);
        }
        if (currentStatus.response?.image_url) {
          console.log(`   Image URL: ${currentStatus.response.image_url}`);
        }
        if (currentStatus.response?.duration) {
          console.log(`   Duration: ${currentStatus.response.duration}s`);
        }
        break;
      } else if (currentStatus.status === 'FAILED' || currentStatus.status.includes('FAILED')) {
        console.log('❌ Task failed!');
        if (currentStatus.failReason) {
          console.log(`   Error: ${currentStatus.failReason}`);
        }
        break;
      }
    }

    if (attempts >= maxAttempts) {
      console.log('⏱️  Task still processing after 30 seconds');
      console.log(`   You can check status later with Task ID: ${taskId}`);
    }

    console.log('\n✨ All tests completed!\n');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   API Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testSunoAPI();
