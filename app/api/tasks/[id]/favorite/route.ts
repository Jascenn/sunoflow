export const runtime = "edge";

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getErrorMessage } from '@/lib/utils';



/**
 * Toggle favorite status of a task
 * POST /api/tasks/[id]/favorite
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const taskId = id;

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

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (task.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Toggle favorite status
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        isFavorite: !task.isFavorite,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      isFavorite: updatedTask.isFavorite,
      task: updatedTask,
    });

  } catch (error: unknown) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      {
        error: 'Failed to toggle favorite',
        details: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
