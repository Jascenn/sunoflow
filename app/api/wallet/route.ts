export const runtime = "edge";

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getErrorMessage } from '@/lib/utils';

// 

export async function GET() {
  try {
    // ... (lines 9-34 unchanged, implicitly)
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

  } catch (error: unknown) {
    console.error('Error in /api/wallet:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch wallet',
        details: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
