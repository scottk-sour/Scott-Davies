import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/stock-alerts
 * Get all stock alerts for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const alerts = await prisma.stockAlert.findMany({
      where: {
        userId: session.user.id,
        acknowledged: false,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            quantity: true,
            mainImageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error('Get stock alerts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock alerts' },
      { status: 500 }
    );
  }
}
