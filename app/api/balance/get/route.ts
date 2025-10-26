import { NextRequest, NextResponse } from 'next/server';

const SHEETS_BALANCES_GET_URL = process.env.SHEETS_BALANCES_GET_URL;
const SHEETS_WEBHOOK_SECRET = process.env.SHEETS_WEBHOOK_SECRET;

// In-memory cache
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 30_000; // 30 seconds

interface BalanceData {
  latest: {
    timestamp: string;
    bankBalance: number;
    cashBalance: number;
  };
  reconcile: {
    monthNetCash: number;
    yearNetCash: number;
  };
  history?: Array<{
    timestamp: string;
    bankBalance: number;
    cashBalance: number;
  }>;
}

/**
 * GET /api/balance/get
 * Fetch latest balances and reconciliation data from Google Sheets
 * Uses 30-second in-memory cache to reduce Sheet API calls
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[BALANCE GET] Starting balance fetch...');

    // Check if webhook is configured
    if (!SHEETS_BALANCES_GET_URL || !SHEETS_WEBHOOK_SECRET) {
      console.error('[✖] Balance webhook not configured');
      return NextResponse.json(
        {
          error: 'Balance webhook not configured. Please set SHEETS_BALANCES_GET_URL and SHEETS_WEBHOOK_SECRET in .env.local'
        },
        { status: 500 }
      );
    }

    // Check cache
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_TTL_MS) {
      console.log('[✔] Returning cached balance data (age: ' + Math.round((now - cacheTimestamp) / 1000) + 's)');
      return NextResponse.json(cachedData);
    }

    // Fetch from Google Sheets
    console.log('[BALANCE GET] Fetching from Google Sheets...');

    const response = await fetch(SHEETS_BALANCES_GET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: SHEETS_WEBHOOK_SECRET,
      }),
    });

    // Check if webhook call was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[✖] Balance webhook error:', response.status, errorText);

      // Check for unauthorized (wrong secret)
      if (response.status === 401 || errorText.includes('Unauthorized')) {
        console.error('[✖] Webhook authentication failed');
        return NextResponse.json(
          {
            error: 'Webhook authentication failed. Please check your SHEETS_WEBHOOK_SECRET.'
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to fetch balance from Google Sheets. Please try again.'
        },
        { status: 500 }
      );
    }

    const responseText = await response.text();
    console.log('[BALANCE GET] Webhook response length:', responseText.length);

    // Parse JSON response
    let data: BalanceData;
    try {
      data = JSON.parse(responseText);
      
      // Validate response structure
      if (!data.latest || typeof data.latest.bankBalance !== 'number' || typeof data.latest.cashBalance !== 'number') {
        console.error('[✖] Invalid response structure:', data);
        return NextResponse.json(
          {
            error: 'Invalid response from Google Sheets. Please check your Balances tab setup.'
          },
          { status: 500 }
        );
      }

      console.log('[✔] Balance data fetched successfully:', {
        bankBalance: data.latest.bankBalance,
        cashBalance: data.latest.cashBalance,
        timestamp: data.latest.timestamp,
      });

      // Update cache
      cachedData = data;
      cacheTimestamp = now;

      return NextResponse.json(data);

    } catch (jsonError) {
      console.error('[✖] Failed to parse JSON response:', jsonError);
      console.error('[✖] Response text:', responseText);
      return NextResponse.json(
        {
          error: 'Invalid JSON response from Google Sheets webhook.'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[✖] Balance get API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch balance. Please try again.' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/balance/get
 * Same as GET but accepts POST for consistency with other endpoints
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

