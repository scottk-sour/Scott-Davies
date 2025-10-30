import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import StockAlertEmail from '@/emails/StockAlert';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/stock-alerts/send
 * Send stock alert emails to users with low inventory
 * Can be triggered manually or via cron job
 */
export async function POST(request: Request) {
  try {
    // Verify auth header if running as cron (optional)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all unacknowledged stock alerts
    const alerts = await prisma.stockAlert.findMany({
      where: {
        acknowledged: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
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

    if (alerts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'No pending alerts',
          emailsSent: 0,
        },
      });
    }

    // Group alerts by user
    const alertsByUser = alerts.reduce((acc, alert) => {
      const userId = alert.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: alert.user,
          alerts: [],
        };
      }
      acc[userId].alerts.push(alert);
      return acc;
    }, {} as Record<string, { user: any; alerts: any[] }>);

    let emailsSent = 0;
    const alertIds: string[] = [];

    // Send email to each user
    for (const [userId, { user, alerts }] of Object.entries(alertsByUser)) {
      try {
        const products = alerts.map((alert) => ({
          title: alert.product.title,
          currentStock: alert.currentStock,
          threshold: alert.threshold,
          mainImageUrl: alert.product.mainImageUrl,
        }));

        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Etsy Organizer <notifications@etsyorganizer.com>',
          to: user.email,
          subject: `Low Stock Alert - ${products.filter(p => p.currentStock === 0).length > 0 ? 'Out of Stock Items' : 'Low Inventory'}`,
          react: StockAlertEmail({
            userName: user.name || 'there',
            products,
            shopUrl: process.env.NEXT_PUBLIC_URL + '/products',
          }),
        });

        emailsSent++;
        alertIds.push(...alerts.map((a) => a.id));
      } catch (error) {
        console.error(`Failed to send alert to user ${userId}:`, error);
        // Continue with other users even if one fails
      }
    }

    // Mark alerts as acknowledged
    if (alertIds.length > 0) {
      await prisma.stockAlert.updateMany({
        where: {
          id: {
            in: alertIds,
          },
        },
        data: {
          acknowledged: true,
          acknowledgedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        emailsSent,
        alertsProcessed: alertIds.length,
      },
    });
  } catch (error) {
    console.error('Stock alert send error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send stock alerts' },
      { status: 500 }
    );
  }
}
