import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/orders/[id]
 * Get single order with detailed information
 */
export async function GET(
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

    // Verify user owns this order
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        shop: { userId: session.user.id },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                mainImageUrl: true,
                costPerUnit: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[id]
 * Update order status, tracking info, and shipping details
 */
export async function PATCH(
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

    const body = await request.json();
    const { status, trackingNumber, shippingCarrier, shippedAt } = body;

    // Verify user owns this order
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        shop: { userId: session.user.id },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order
    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...(status !== undefined && { status }),
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(shippingCarrier !== undefined && { shippingCarrier }),
        ...(shippedAt !== undefined && {
          shippedAt: shippedAt ? new Date(shippedAt) : null
        }),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                mainImageUrl: true,
                costPerUnit: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
