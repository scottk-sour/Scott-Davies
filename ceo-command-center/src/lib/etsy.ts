/**
 * Etsy API Integration
 * Handles OAuth, token management, and API calls to Etsy API v3
 */

// Etsy API v3 OAuth configuration
const ETSY_API_BASE = 'https://openapi.etsy.com/v3';
const ETSY_OAUTH_BASE = 'https://www.etsy.com/oauth';

// Environment variables (add these to Vercel)
const ETSY_CLIENT_ID = process.env.ETSY_API_KEY || '';
const ETSY_CLIENT_SECRET = process.env.ETSY_CLIENT_SECRET || '';
const ETSY_REDIRECT_URI = process.env.NEXT_PUBLIC_URL
  ? `${process.env.NEXT_PUBLIC_URL}/api/etsy/callback`
  : 'http://localhost:3000/api/etsy/callback';

// OAuth scopes needed
const ETSY_SCOPES = [
  'listings_r',      // Read listings (products)
  'shops_r',         // Read shop info
  'transactions_r',  // Read orders
  // 'listings_w',   // Write listings (for updating stock) - add if needed
].join(' ');

/**
 * Generate OAuth URL to connect Etsy shop
 */
export function getEtsyOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: ETSY_CLIENT_ID,
    redirect_uri: ETSY_REDIRECT_URI,
    scope: ETSY_SCOPES,
    state, // CSRF protection - pass user ID or session token
  });

  return `${ETSY_OAUTH_BASE}/connect?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<EtsyTokenResponse> {
  const response = await fetch(`${ETSY_API_BASE}/public/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: ETSY_CLIENT_ID,
      client_secret: ETSY_CLIENT_SECRET,
      redirect_uri: ETSY_REDIRECT_URI,
      code,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Etsy OAuth error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Refresh expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<EtsyTokenResponse> {
  const response = await fetch(`${ETSY_API_BASE}/public/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: ETSY_CLIENT_ID,
      client_secret: ETSY_CLIENT_SECRET,
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Etsy token refresh error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Get shop details by shop ID
 */
export async function getShopById(shopId: string, accessToken: string): Promise<EtsyShop> {
  const response = await etsyApiCall(`/application/shops/${shopId}`, accessToken);
  return response;
}

/**
 * Get all active listings (products) for a shop
 */
export async function getShopListings(
  shopId: string,
  accessToken: string,
  limit = 100,
  offset = 0
): Promise<EtsyListingsResponse> {
  const response = await etsyApiCall(
    `/application/shops/${shopId}/listings/active?limit=${limit}&offset=${offset}`,
    accessToken
  );
  return response;
}

/**
 * Get shop receipts (orders)
 */
export async function getShopReceipts(
  shopId: string,
  accessToken: string,
  limit = 100,
  offset = 0
): Promise<EtsyReceiptsResponse> {
  const response = await etsyApiCall(
    `/application/shops/${shopId}/receipts?limit=${limit}&offset=${offset}&was_paid=true`,
    accessToken
  );
  return response;
}

/**
 * Get receipt (order) details including line items
 */
export async function getReceipt(
  shopId: string,
  receiptId: string,
  accessToken: string
): Promise<EtsyReceipt> {
  const response = await etsyApiCall(
    `/application/shops/${shopId}/receipts/${receiptId}`,
    accessToken
  );
  return response;
}

/**
 * Get transactions (line items) for a receipt
 */
export async function getReceiptTransactions(
  shopId: string,
  receiptId: string,
  accessToken: string
): Promise<EtsyTransactionsResponse> {
  const response = await etsyApiCall(
    `/application/shops/${shopId}/receipts/${receiptId}/transactions`,
    accessToken
  );
  return response;
}

/**
 * Generic Etsy API call with rate limiting and error handling
 */
async function etsyApiCall(endpoint: string, accessToken: string): Promise<any> {
  const url = `${ETSY_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'x-api-key': ETSY_CLIENT_ID,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
    }

    // Handle expired token
    if (response.status === 401) {
      throw new Error('Access token expired or invalid');
    }

    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Etsy API error: ${response.status} - ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Check if access token is expired
 */
export function isTokenExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return true;
  return new Date() >= new Date(expiryDate);
}

// ==========================================
// TYPES
// ==========================================

export interface EtsyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export interface EtsyShop {
  shop_id: number;
  shop_name: string;
  url: string;
  currency_code: string;
  // Add more fields as needed
}

export interface EtsyListing {
  listing_id: number;
  title: string;
  description: string;
  price: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  quantity: number;
  state: 'active' | 'inactive' | 'sold_out' | 'draft';
  url: string;
  views: number;
  num_favorers: number;
  images?: Array<{
    url_570xN: string;
    url_fullxfull: string;
  }>;
  // Add more fields as needed
}

export interface EtsyListingsResponse {
  count: number;
  results: EtsyListing[];
}

export interface EtsyReceipt {
  receipt_id: number;
  receipt_type: number;
  order_id: string;
  seller_user_id: number;
  buyer_user_id: number;
  buyer_email: string;
  name: string;
  first_line: string;
  second_line: string | null;
  city: string;
  state: string;
  zip: string;
  country_iso: string;
  payment_method: string;
  payment_email: string;
  message_from_buyer: string | null;
  message_from_seller: string | null;
  was_paid: boolean;
  total_tax_cost: string;
  total_vat_cost: string;
  total_price: string;
  total_shipping_cost: string;
  currency_code: string;
  message_from_payment: string | null;
  shipped_timestamp: number | null;
  create_timestamp: number;
  update_timestamp: number;
  // Add more fields as needed
}

export interface EtsyReceiptsResponse {
  count: number;
  results: EtsyReceipt[];
}

export interface EtsyTransaction {
  transaction_id: number;
  title: string;
  description: string;
  seller_user_id: number;
  buyer_user_id: number;
  create_timestamp: number;
  paid_timestamp: number;
  shipped_timestamp: number | null;
  quantity: number;
  listing_image_id: number | null;
  receipt_id: number;
  listing_id: number;
  transaction_type: string;
  price: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  shipping_cost: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  // Add more fields as needed
}

export interface EtsyTransactionsResponse {
  count: number;
  results: EtsyTransaction[];
}
