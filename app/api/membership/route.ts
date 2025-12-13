export const runtime = "edge";

import { NextResponse } from 'next/server';

// 
import { auth } from '@clerk/nextjs/server';

import { prisma } from '@/lib/prisma';


export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ tier: 'FREE' });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: {
                membershipTier: true,
                membershipExpiresAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({ tier: 'FREE' });
        }

        // Check if PRO is still active
        const tier = user.membershipTier || 'FREE';
        const isActive = tier === 'PRO' && user.membershipExpiresAt
            ? new Date() < user.membershipExpiresAt
            : tier === 'FREE';

        return NextResponse.json({
            tier: isActive ? tier : 'FREE',
            expiresAt: user.membershipExpiresAt,
            isActive,
        });
    } catch (error) {
        console.error('Error fetching membership:', error);
        return NextResponse.json({ tier: 'FREE' });
    }
}

import { NextRequest } from 'next/server';


export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { planId } = await request.json();

        if (planId !== 'pro') {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Mock upgrade: Update user to PRO
        // Set expiry to 30 days from now
        const user = await prisma.user.update({
            where: { clerkId: userId },
            data: {
                membershipTier: 'PRO',
                membershipExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                stripeSubscriptionId: `mock_sub_${Date.now()}`, // Add mock subscription ID
            },
        });

        console.log(`✅ [MEMBERSHIP] User ${userId} upgraded to PRO`);

        return NextResponse.json({ success: true, tier: user.membershipTier });
    } catch (error) {
        console.error('[MEMBERSHIP_UPGRADE] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
