import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getErrorMessage } from '@/lib/utils';



/**
 * Download task audio file
 * GET /api/tasks/[id]/download?format=mp3
 *
 * Supported formats: mp3, wav, flac
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const taskId = id;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'mp3';

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

    // Check if task has audio
    if (!task.audioUrl) {
      return NextResponse.json(
        { error: 'Audio not available yet' },
        { status: 404 }
      );
    }

    // Validate format
    const allowedFormats = ['mp3', 'wav', 'flac'];
    if (!allowedFormats.includes(format.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid format. Allowed: ${allowedFormats.join(', ')}` },
        { status: 400 }
      );
    }

    // For now, 302.ai returns MP3 files
    // In the future, you could implement format conversion here
    const downloadUrl = task.audioUrl;
    const filename = `${task.title || 'music'}_${task.id}.${format}`;

    // Return the download URL with proper headers
    return NextResponse.json({
      success: true,
      downloadUrl,
      filename,
      format,
      message: format !== 'mp3'
        ? 'Note: Format conversion not yet implemented. Returning original MP3 file.'
        : null,
    });

  } catch (error: unknown) {
    console.error('Error preparing download:', error);
    return NextResponse.json(
      {
        error: 'Failed to prepare download',
        details: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
