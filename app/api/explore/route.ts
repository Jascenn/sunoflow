import { NextResponse } from 'next/server';

export const runtime = 'edge';
import { getSunoClient } from '@/lib/suno-client';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');

        console.log('[API] Fetching explore feed, page:', page);
        const client = getSunoClient();
        const data = await client.getPublicFeed({ page });

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error: any) {
        console.error('[API] Explore feed error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch feed' },
            { status: 500 }
        );
    }
}
