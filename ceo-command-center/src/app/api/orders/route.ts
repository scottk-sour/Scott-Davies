import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/orders
 * Get all orders for user's Etsy shop
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

    // Get user's Etsy shop
    const etsyShop = await prisma.etsyShop.findFirst({
      where: { userId: session.user.id },
    });

    if (!etsyShop) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get all orders for the shop with items
    const orders = await prisma.order.findMany({
      where: { shopId: etsyShop.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                mainImageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { orderDate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
