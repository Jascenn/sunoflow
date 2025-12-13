import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSunoClient } from '@/lib/suno-client';
import { getErrorMessage } from '@/lib/utils';



export async function GET(request: NextRequest) {
  try {
    // Auth Check
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all tasks for this user
    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent 50 tasks
    });

    return NextResponse.json({
      success: true,
      tasks,
    });

  } catch (error: unknown) {
    console.error('Error in /api/tasks:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch tasks',
        details: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
