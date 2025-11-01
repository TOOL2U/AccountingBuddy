import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory cache for balance data
 */
interface CachedBalance {
  data: any;
  timestamp: number;
}

let balanceCache: CachedBalance | null = null;
const CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * POST /api/balance/get
 * Get latest balances and reconciliation data from Google Sheets
 */
export async function POST(request: NextRequest) {
  try {
    // Check cache first
    const now = Date.now();
    if (balanceCache && (now - balanceCache.timestamp) < CACHE_TTL) {
      return NextResponse.json(balanceCache.data);
    }

    // Get Google Sheets webhook URL
    const webhookUrl = process.env.SHEETS_BALANCES_GET_URL;
    const secret = process.env.SHEETS_WEBHOOK_SECRET;

    if (!webhookUrl || !secret) {
      console.error('Balance webhook not configured');
      return NextResponse.json(
        { error: 'Balance service not configured' },
        { status: 500 }
      );
    }

    // Fetch from Google Sheets
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'balancesGetLatest',
        secret
      }),
      redirect: 'manual'  // Don't follow 302 redirects (Apps Script returns 302 with data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sheets webhook error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch balance from Google Sheets' },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to fetch balance' },
        { status: 500 }
      );
    }

    // Cache the response
    balanceCache = {
      data,
      timestamp: now,
    };

    return NextResponse.json(data);

  } catch (error) {
    console.error('Balance get error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch balance',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/balance/get
 * Same as POST but for convenience
 */
export async function GET(request: NextRequest) {
  return POST(request);
}

