import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/products
 * Get all products for user's Etsy shop
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

    // Get all products for the shop
    const products = await prisma.product.findMany({
      where: { shopId: etsyShop.id },
      orderBy: [
        { quantity: 'asc' }, // Show low stock first
        { title: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
