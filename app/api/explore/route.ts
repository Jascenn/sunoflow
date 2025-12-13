export const runtime = "edge";

import { NextResponse } from 'next/server';

// 
import { getSunoClient } from '@/lib/suno-client';
import { getErrorMessage } from '@/lib/utils';


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
    } catch (error: unknown) {
        console.error('[API] Explore feed error:', error);
        return NextResponse.json(
            { success: false, error: getErrorMessage(error) },
            { status: 500 }
        );
    }
}
