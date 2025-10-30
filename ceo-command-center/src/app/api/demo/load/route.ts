import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/demo/load
 * Load demo Etsy data (products and orders) for testing
 */
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check if user already has an Etsy shop
    let etsyShop = await prisma.etsyShop.findFirst({
      where: { userId },
    })

    // Create demo Etsy shop if doesn't exist
    if (!etsyShop) {
      etsyShop = await prisma.etsyShop.create({
        data: {
          userId,
          etsyShopId: 'demo-shop-' + userId,
          shopName: 'My Demo Etsy Shop',
          shopUrl: 'https://etsy.com/shop/demo',
          currency: 'GBP',
          accessToken: 'demo-token',
          syncEnabled: true,
        },
      })
    }

    // Create demo products
    const products = await prisma.product.createMany({
      data: [
        {
          shopId: etsyShop.id,
          etsyListingId: 'demo-listing-001',
          title: 'Hand-Knitted Wool Scarf - Winter Collection',
          description: 'Cosy hand-knitted scarf made from 100% merino wool. Perfect for cold winter days.',
          price: 28.50,
          costPerUnit: 12.00,
          quantity: 15,
          sku: 'SCARF-WIN-001',
          state: 'ACTIVE',
          currency: 'GBP',
          mainImageUrl: 'https://placehold.co/400x400/4F46E5/white?text=Scarf',
        },
        {
          shopId: etsyShop.id,
          etsyListingId: 'demo-listing-002',
          title: 'Ceramic Coffee Mug - Handmade Pottery',
          description: 'Beautiful handmade ceramic mug, dishwasher and microwave safe. Holds 350ml.',
          price: 18.00,
          costPerUnit: 6.50,
          quantity: 8,
          sku: 'MUG-CER-002',
          state: 'ACTIVE',
          currency: 'GBP',
          mainImageUrl: 'https://placehold.co/400x400/059669/white?text=Mug',
        },
        {
          shopId: etsyShop.id,
          etsyListingId: 'demo-listing-003',
          title: 'Macrame Wall Hanging - Boho Home Decor',
          description: 'Large macrame wall hanging, perfect for living room or bedroom. Made with natural cotton cord.',
          price: 45.00,
          costPerUnit: 18.00,
          quantity: 3,
          sku: 'MAC-WALL-003',
          state: 'ACTIVE',
          currency: 'GBP',
          mainImageUrl: 'https://placehold.co/400x400/DC2626/white?text=Macrame',
        },
        {
          shopId: etsyShop.id,
          etsyListingId: 'demo-listing-004',
          title: 'Soy Wax Candle Set - Lavender & Vanilla',
          description: 'Set of 3 handpoured soy wax candles with essential oils. 40+ hour burn time each.',
          price: 24.00,
          costPerUnit: 9.00,
          quantity: 22,
          sku: 'CAN-SOY-004',
          state: 'ACTIVE',
          currency: 'GBP',
          mainImageUrl: 'https://placehold.co/400x400/7C3AED/white?text=Candles',
        },
        {
          shopId: etsyShop.id,
          etsyListingId: 'demo-listing-005',
          title: 'Leather Journal - A5 Handbound Notebook',
          description: 'Premium leather journal with handmade paper. Perfect for writing, sketching, or planning.',
          price: 32.00,
          costPerUnit: 14.00,
          quantity: 2,
          sku: 'JRN-LEA-005',
          state: 'ACTIVE',
          currency: 'GBP',
          mainImageUrl: 'https://placehold.co/400x400/EA580C/white?text=Journal',
        },
        {
          shopId: etsyShop.id,
          etsyListingId: 'demo-listing-006',
          title: 'Silver Earrings - Hammered Disc Design',
          description: 'Handmade sterling silver earrings with hammered texture. Lightweight and comfortable.',
          price: 22.00,
          costPerUnit: 8.50,
          quantity: 0,
          sku: 'EAR-SIL-006',
          state: 'SOLD_OUT',
          currency: 'GBP',
          mainImageUrl: 'https://placehold.co/400x400/0891B2/white?text=Earrings',
        },
      ],
    })

    // Create demo orders
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    await prisma.order.createMany({
      data: [
        {
          shopId: etsyShop.id,
          etsyOrderId: 'demo-order-001',
          orderNumber: '#1001',
          buyerName: 'Sarah Johnson',
          buyerEmail: 'sarah.j@example.com',
          status: 'SHIPPED',
          subtotal: 28.50,
          shippingCost: 3.50,
          total: 32.00,
          orderDate: threeDaysAgo,
          trackingNumber: 'GB1234567890',
        },
        {
          shopId: etsyShop.id,
          etsyOrderId: 'demo-order-002',
          orderNumber: '#1002',
          buyerName: 'Michael Chen',
          buyerEmail: 'mchen@example.com',
          status: 'PENDING',
          subtotal: 36.00,
          shippingCost: 0.00,
          total: 36.00,
          orderDate: twoDaysAgo,
        },
        {
          shopId: etsyShop.id,
          etsyOrderId: 'demo-order-003',
          orderNumber: '#1003',
          buyerName: 'Emma Thompson',
          buyerEmail: 'emma.t@example.com',
          status: 'DELIVERED',
          subtotal: 45.00,
          shippingCost: 4.95,
          total: 49.95,
          orderDate: threeDaysAgo,
          trackingNumber: 'GB0987654321',
        },
        {
          shopId: etsyShop.id,
          etsyOrderId: 'demo-order-004',
          orderNumber: '#1004',
          buyerName: 'James Wilson',
          buyerEmail: 'jwilson@example.com',
          status: 'PENDING',
          subtotal: 72.00,
          shippingCost: 0.00,
          total: 72.00,
          orderDate: yesterday,
        },
        {
          shopId: etsyShop.id,
          etsyOrderId: 'demo-order-005',
          orderNumber: '#1005',
          buyerName: 'Olivia Brown',
          buyerEmail: 'olivia.b@example.com',
          status: 'SHIPPED',
          subtotal: 32.00,
          shippingCost: 3.50,
          total: 35.50,
          orderDate: twoDaysAgo,
          trackingNumber: 'GB5647382910',
        },
      ],
    })

    // Create stock alerts for low/out of stock products
    const createdProducts = await prisma.product.findMany({
      where: { shopId: etsyShop.id },
    })

    const lowStockProducts = createdProducts.filter(p => p.quantity <= 5)

    for (const product of lowStockProducts) {
      await prisma.stockAlert.create({
        data: {
          userId,
          productId: product.id,
          threshold: 5,
          currentStock: product.quantity,
          acknowledged: false,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data loaded successfully',
      data: {
        productsCreated: 6,
        ordersCreated: 5,
        stockAlertsCreated: lowStockProducts.length,
      },
    })
  } catch (error) {
    console.error('Error loading demo data:', error)
    return NextResponse.json(
      { error: 'Failed to load demo data' },
      { status: 500 }
    )
  }
}
