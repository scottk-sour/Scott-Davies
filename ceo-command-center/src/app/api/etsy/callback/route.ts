import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exchangeCodeForToken, getShopById } from '@/lib/etsy';
import { prisma } from '@/lib/db';

/**
 * GET /api/etsy/callback
 * Handle OAuth callback from Etsy after user authorizes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Should match user ID
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=etsy_auth_denied`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=etsy_auth_invalid`
      );
    }

    // Verify user session matches state (CSRF protection)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=etsy_auth_unauthorized`
      );
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForToken(code);

    // Calculate token expiry
    const tokenExpiry = new Date();
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + tokenResponse.expires_in);

    // Get shop details from Etsy
    // Note: We need the shop ID. Etsy returns it in the token response or we can get it from /v3/application/users/me
    // For now, we'll make a call to get user's shops
    const shopsResponse = await fetch(
      'https://openapi.etsy.com/v3/application/users/me/shops',
      {
        headers: {
          'Authorization': `Bearer ${tokenResponse.access_token}`,
          'x-api-key': process.env.ETSY_API_KEY || '',
        },
      }
    );

    if (!shopsResponse.ok) {
      throw new Error('Failed to fetch shop details from Etsy');
    }

    const shopsData = await shopsResponse.json();
    const shop = shopsData.results[0]; // Get first shop

    if (!shop) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=etsy_no_shop`
      );
    }

    // Save or update Etsy shop in database
    await prisma.etsyShop.upsert({
      where: {
        etsyShopId: shop.shop_id.toString(),
      },
      update: {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenExpiry,
        lastSyncedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        etsyShopId: shop.shop_id.toString(),
        shopName: shop.shop_name,
        shopUrl: shop.url || null,
        currency: shop.currency_code || 'USD',
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenExpiry,
        syncEnabled: true,
      },
    });

    // Redirect to dashboard with success
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard?etsy_connected=true`
    );
  } catch (error) {
    console.error('Etsy callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard?error=etsy_connection_failed`
    );
  }
}
