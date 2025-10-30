import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/stock-alerts/[id]/acknowledge
 * Acknowledge a stock alert
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user owns this alert
    const alert = await prisma.stockAlert.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!alert) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }

    // Mark as acknowledged
    const updated = await prisma.stockAlert.update({
      where: { id: params.id },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to acknowledge alert' },
      { status: 500 }
    );
  }
}
