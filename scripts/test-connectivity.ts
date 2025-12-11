
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const KIE_BASE_URL = 'https://api.kie.ai';
const PROVIDER_302_URL = 'https://api.302.ai'; // Default 302 endpoint

async function testKie(apiKey: string) {
    console.log('\n🔵 Testing Kie.ai Connectivity...');
    console.log(`Endpoint: ${KIE_BASE_URL}/api/v1/generate/record-info`);

    try {
        // Trying record-info with a dummy task ID to check endpoint existence
        const dummyId = 'test-id';
        const res = await axios.get(`${KIE_BASE_URL}/api/v1/generate/record-info`, {
            params: { taskId: dummyId },
            headers: { 'Authorization': `Bearer ${apiKey}` },
            validateStatus: () => true
        });

        console.log(`   Status: ${res.status}`);
        if (res.status === 200) {
            console.log('✅ Kie.ai Connection Successful! (Endpoint exists)');
            console.log('   Response:', JSON.stringify(res.data).slice(0, 100) + '...');
            return true;
        } else if (res.status === 404) {
            console.log('❌ Kie.ai Endpoint returned 404. Path might still be wrong or ID not found handled as 404.');
            return false;
        } else {
            console.log('⚠️  Kie.ai returned:', res.status, res.data);
            return true; // Non-404 means endpoint technically exists but maybe auth/id error
        }
    } catch (error: any) {
        console.log('❌ Kie.ai Connection Failed:', error.message);
        return false;
    }
}

async function test302ai(apiKey: string) {
    console.log('\n🟠 Testing 302.ai Connectivity...');
    console.log(`Endpoint: ${PROVIDER_302_URL}/suno/fetch (Mock ID)`);

    try {
        // 302.ai doesn't have a standard list endpoint documented in our client,
        // so we try to fetch a non-existent ID to see if we get a JSON response vs HTML (Baidu).
        const dummyId = 'test-connectivity-id';
        const res = await axios.get(`${PROVIDER_302_URL}/suno/fetch/${dummyId}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
            validateStatus: () => true // Accept all status codes to parse body
        });

        const contentType = res.headers['content-type'];
        console.log(`   Status: ${res.status}`);
        console.log(`   Content-Type: ${contentType}`);

        if (contentType && contentType.includes('text/html')) {
            console.log('❌ 302.ai is returning HTML (likely Baidu/Error page). Domain might be blocked.');
            return false;
        }

        if (res.data && (res.data.code !== undefined || res.data.status)) {
            console.log('✅ 302.ai Connection Successful (JSON response received).');
            console.log('   (Note: verification is based on receiving structured JSON, even if it is an error about invalid ID).');
            return true;
        }

        console.log('⚠️  Received response but format is unclear:', res.data);
        return false;

    } catch (error: any) {
        console.log('❌ 302.ai Connection Failed:', error.message);
        return false;
    }
}

async function run() {
    const provider = process.argv[2] || process.env.SUNO_PROVIDER || 'kie';
    const apiKey = process.env.SUNO_API_KEY;

    if (!apiKey) {
        console.error('❌ Missing SUNO_API_KEY in .env');
        process.exit(1);
    }

    console.log(`Testing Connectivity for Provider: ${provider.toUpperCase()}`);
    console.log(`API Key: ${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`);

    if (provider === 'kie' || provider === 'all') {
        await testKie(apiKey);
    }

    if (provider === '302ai' || provider === 'all') {
        await test302ai(apiKey);
    }
}

run();
