import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  getShopListings,
  getShopReceipts,
  getReceiptTransactions,
  refreshAccessToken,
  isTokenExpired,
} from '@/lib/etsy';

/**
 * POST /api/etsy/sync
 * Manually trigger sync of products and orders from Etsy
 */
export async function POST() {
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
      where: {
        userId: session.user.id,
        syncEnabled: true,
      },
    });

    if (!etsyShop) {
      return NextResponse.json(
        { success: false, error: 'No Etsy shop connected' },
        { status: 404 }
      );
    }

    // Check if token is expired and refresh if needed
    let accessToken = etsyShop.accessToken;
    if (isTokenExpired(etsyShop.tokenExpiry)) {
      if (!etsyShop.refreshToken) {
        return NextResponse.json(
          { success: false, error: 'Token expired and no refresh token available' },
          { status: 401 }
        );
      }

      const newTokens = await refreshAccessToken(etsyShop.refreshToken);
      const newExpiry = new Date();
      newExpiry.setSeconds(newExpiry.getSeconds() + newTokens.expires_in);

      // Update tokens in database
      await prisma.etsyShop.update({
        where: { id: etsyShop.id },
        data: {
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token,
          tokenExpiry: newExpiry,
        },
      });

      accessToken = newTokens.access_token;
    }

    // Sync products (listings)
    const listingsResponse = await getShopListings(
      etsyShop.etsyShopId,
      accessToken,
      100
    );

    let syncedProducts = 0;
    for (const listing of listingsResponse.results) {
      await prisma.product.upsert({
        where: {
          etsyListingId: listing.listing_id.toString(),
        },
        update: {
          title: listing.title,
          description: listing.description || null,
          quantity: listing.quantity,
          price: listing.price.amount / listing.price.divisor,
          currency: listing.price.currency_code,
          state: listing.state.toUpperCase() as any,
          mainImageUrl: listing.images?.[0]?.url_570xN || null,
          views: listing.views,
          favorites: listing.num_favorers,
          lastSyncedAt: new Date(),
        },
        create: {
          shopId: etsyShop.id,
          etsyListingId: listing.listing_id.toString(),
          title: listing.title,
          description: listing.description || null,
          quantity: listing.quantity,
          price: listing.price.amount / listing.price.divisor,
          currency: listing.price.currency_code,
          state: listing.state.toUpperCase() as any,
          mainImageUrl: listing.images?.[0]?.url_570xN || null,
          views: listing.views,
          favorites: listing.num_favorers,
          lastSyncedAt: new Date(),
        },
      });
      syncedProducts++;
    }

    // Sync orders (receipts)
    const receiptsResponse = await getShopReceipts(
      etsyShop.etsyShopId,
      accessToken,
      100
    );

    let syncedOrders = 0;
    for (const receipt of receiptsResponse.results) {
      // Parse amounts (Etsy returns as strings)
      const subtotal = parseFloat(receipt.total_price);
      const shipping = parseFloat(receipt.total_shipping_cost);
      const tax = parseFloat(receipt.total_tax_cost);

      // Determine order status
      let status = 'PENDING';
      if (receipt.shipped_timestamp) {
        status = 'SHIPPED';
      }

      const order = await prisma.order.upsert({
        where: {
          etsyOrderId: receipt.receipt_id.toString(),
        },
        update: {
          buyerEmail: receipt.buyer_email || null,
          buyerName: receipt.name || null,
          subtotal,
          shippingCost: shipping,
          taxAmount: tax,
          total: subtotal + shipping + tax,
          status: status as any,
          shippedAt: receipt.shipped_timestamp
            ? new Date(receipt.shipped_timestamp * 1000)
            : null,
          lastSyncedAt: new Date(),
        },
        create: {
          shopId: etsyShop.id,
          etsyOrderId: receipt.receipt_id.toString(),
          orderNumber: receipt.order_id || receipt.receipt_id.toString(),
          buyerEmail: receipt.buyer_email || null,
          buyerName: receipt.name || null,
          subtotal,
          shippingCost: shipping,
          taxAmount: tax,
          total: subtotal + shipping + tax,
          status: status as any,
          orderDate: new Date(receipt.create_timestamp * 1000),
          shippedAt: receipt.shipped_timestamp
            ? new Date(receipt.shipped_timestamp * 1000)
            : null,
          lastSyncedAt: new Date(),
        },
      });

      // Sync order items (transactions)
      const transactionsResponse = await getReceiptTransactions(
        etsyShop.etsyShopId,
        receipt.receipt_id.toString(),
        accessToken
      );

      for (const transaction of transactionsResponse.results) {
        const pricePerUnit = transaction.price.amount / transaction.price.divisor;
        const totalPrice = pricePerUnit * transaction.quantity;

        // Find matching product
        const product = await prisma.product.findUnique({
          where: { etsyListingId: transaction.listing_id.toString() },
        });

        await prisma.orderItem.upsert({
          where: {
            etsyTransactionId: transaction.transaction_id.toString(),
          },
          update: {
            quantity: transaction.quantity,
            pricePerUnit,
            totalPrice,
          },
          create: {
            orderId: order.id,
            productId: product?.id || null,
            etsyTransactionId: transaction.transaction_id.toString(),
            productTitle: transaction.title,
            quantity: transaction.quantity,
            pricePerUnit,
            totalPrice,
            costPerUnit: product?.costPerUnit || null,
          },
        });
      }

      syncedOrders++;
    }

    // Check for low stock and create alerts
    const lowStockProducts = await prisma.product.findMany({
      where: {
        shopId: etsyShop.id,
        quantity: {
          lte: etsyShop.defaultStockThreshold,
        },
      },
    });

    for (const product of lowStockProducts) {
      // Check if alert already exists
      const existingAlert = await prisma.stockAlert.findFirst({
        where: {
          userId: session.user.id,
          productId: product.id,
          acknowledged: false,
        },
      });

      if (!existingAlert) {
        await prisma.stockAlert.create({
          data: {
            userId: session.user.id,
            productId: product.id,
            alertType: product.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
            threshold: etsyShop.defaultStockThreshold,
            currentStock: product.quantity,
          },
        });
      }
    }

    // Update shop last synced time
    await prisma.etsyShop.update({
      where: { id: etsyShop.id },
      data: { lastSyncedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: {
        products: syncedProducts,
        orders: syncedOrders,
        lowStockAlerts: lowStockProducts.length,
      },
    });
  } catch (error) {
    console.error('Etsy sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync with Etsy' },
      { status: 500 }
    );
  }
}
