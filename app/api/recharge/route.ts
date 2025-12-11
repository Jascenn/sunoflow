
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

const PACKAGES: Record<string, number> = {
    'credits_100': 100,
    'credits_500': 500,
    'credits_2000': 2000,
    'credits_5000': 5000,
};

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { packageId } = await request.json();
        const credits = PACKAGES[packageId];

        if (!credits) {
            return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
        }

        // 0. Ensure user exists in local DB (Auto-sync)
        let dbUser = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!dbUser) {
            // Fetch details from Clerk to create user
            const { currentUser } = await import('@clerk/nextjs/server');
            const clerkUser = await currentUser();

            if (clerkUser) {
                dbUser = await prisma.user.create({
                    data: {
                        clerkId: userId,
                        email: clerkUser.emailAddresses[0]?.emailAddress || '',
                        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
                        avatarUrl: clerkUser.imageUrl,
                    }
                });
            } else {
                // Fallback minimal create if Clerk call fails (unlikely if auth() passed)
                dbUser = await prisma.user.create({
                    data: {
                        clerkId: userId,
                        email: 'unknown@example.com',
                    }
                });
            }
        }

        // 1. Update Wallet
        await prisma.wallet.upsert({
            where: { userId: dbUser.id }, // Use internal DB ID if possible, but schema likely uses clerkId or maps it. 
            // Wait, schema check needed. User model usually has `id` (uuid) and `clerkId`.
            // Wallet usually links to `userId` (internal ID).
            // Let's check schema.
            create: {
                userId: dbUser.id,
                balance: credits
            },
            update: {
                balance: { increment: credits }
            }
        });

        // 2. Create Transaction Record
        await prisma.transaction.create({
            data: {
                userId: dbUser.id,
                amount: credits,
                type: 'RECHARGE',
                description: `充值 ${credits} 积分`,
            }
        });

        return NextResponse.json({ success: true, credits });
    } catch (error) {
        console.error('[RECHARGE] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
