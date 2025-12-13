import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getErrorMessage } from '@/lib/utils';



export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
        const type = searchParams.get('type');

        // Get user from database to find internal ID
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const whereClause: Prisma.TransactionWhereInput = {
            userId: user.id,
        };

        if (type && type !== 'all') {
            whereClause.type = type;
        }

        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        return NextResponse.json({ transactions });
    } catch (error: unknown) {
        console.error('[TRANSACTIONS] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: getErrorMessage(error) }, { status: 500 });
    }
}
