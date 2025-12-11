import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'edge';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { Wallet: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wallet: user.Wallet,  // 注意：include 用 Wallet，但返回给前端用小写 wallet
    });

  } catch (error: any) {
    console.error('Error in /api/wallet:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch wallet',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
