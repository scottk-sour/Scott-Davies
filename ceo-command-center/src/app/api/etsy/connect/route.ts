import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getEtsyOAuthUrl } from '@/lib/etsy';

/**
 * GET /api/etsy/connect
 * Generate Etsy OAuth URL for user to authorize shop connection
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

    // Use user ID as state for CSRF protection
    const state = session.user.id;
    const oauthUrl = getEtsyOAuthUrl(state);

    return NextResponse.json({
      success: true,
      data: { url: oauthUrl },
    });
  } catch (error) {
    console.error('Etsy connect error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate Etsy connection URL' },
      { status: 500 }
    );
  }
}
