import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const runtime = 'edge';

/**
 * Manual user sync endpoint
 * Creates a user in the database if they don't exist
 * This is a temporary solution until the Clerk webhook is set up
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get full user details from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: 'Clerk user not found' }, { status: 404 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { Wallet: true },
    });

    if (existingUser) {
      // If called from form, redirect
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/x-www-form-urlencoded')) {
        return NextResponse.redirect(new URL('/profile', request.url));
      }
      return NextResponse.json({
        message: 'User already exists',
        user: existingUser,
        alreadyExists: true,
      });
    }

    // Create user with wallet and initial transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: clerkUser.firstName
            ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
            : null,
          avatarUrl: clerkUser.imageUrl,
        },
      });

      // Create wallet with initial balance
      const wallet = await tx.wallet.create({
        data: {
          userId: user.id,
          balance: 100, // Initial credits
          version: 0,
        },
      });

      // Record the initial credit transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: 100,
          type: 'RECHARGE',
          description: 'Initial signup bonus',
        },
      });

      return { user, wallet };
    });

    // If called from form, redirect
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: result.user,
      Wallet: result.wallet,
      alreadyExists: false,
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
