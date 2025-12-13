
import dotenv from 'dotenv';
import { getSunoClient } from '../lib/suno-client';

// Load environment variables
dotenv.config();

async function main() {
    console.log('🧪 Starting SunoClient Verification...');

    try {
        const client = getSunoClient();
        console.log('✅ Client initialized successfully.');

        // Only test Public Feed as it's likely read-only
        console.log('📡 Testing getPublicFeed...');
        const feed = await client.getPublicFeed({ page: 1 });

        console.log(`✅ getPublicFeed returned ${feed.length} items.`);

        if (feed.length > 0) {
            const firstItem = feed[0];
            console.log('🔍 First item sample:', {
                id: firstItem.id,
                title: firstItem.title,
                duration: firstItem.duration,
                typeDur: typeof firstItem.duration
            });

            if (typeof firstItem.duration !== 'number' && firstItem.duration !== null) {
                console.warn('⚠️ Warning: Duration is not a number/null:', firstItem.duration);
            }
        } else {
            console.warn('⚠️ Public feed is empty. This might be normal if the provider mock fallback is used or API is empty.');
        }

    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

main();
