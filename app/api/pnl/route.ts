import { NextRequest, NextResponse } from 'next/server';

/**
 * P&L Data API Route
 * Fetches live KPI data from Google Sheets P&L tab via Apps Script endpoint
 * Implements 60-second in-memory cache to reduce load on Apps Script
 */

// Type definitions
interface PnLPeriodData {
  revenue: number;
  overheads: number;
  propertyPersonExpense: number;
  gop: number;
  ebitdaMargin: number;
}

interface PnLData {
  month: PnLPeriodData;
  year: PnLPeriodData;
  updatedAt: string;
}

interface CachedData {
  data: PnLData;
  timestamp: number;
}

// In-memory cache (60 seconds)
let cache: CachedData | null = null;
const CACHE_DURATION_MS = 60 * 1000; // 60 seconds

/**
 * GET /api/pnl
 * Returns P&L KPI data from Google Sheets
 */
export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const now = Date.now();
    if (cache && (now - cache.timestamp) < CACHE_DURATION_MS) {
      console.log('✅ Returning cached P&L data');
      return NextResponse.json({
        ok: true,
        data: cache.data,
        cached: true,
        cacheAge: Math.floor((now - cache.timestamp) / 1000)
      });
    }

    // Validate environment variables
    const pnlUrl = process.env.SHEETS_PNL_URL;
    const secret = process.env.SHEETS_WEBHOOK_SECRET;

    if (!pnlUrl) {
      console.error('❌ SHEETS_PNL_URL not configured');
      return NextResponse.json(
        { 
          ok: false, 
          error: 'P&L endpoint not configured. Please set SHEETS_PNL_URL in environment variables.' 
        },
        { status: 500 }
      );
    }

    if (!secret) {
      console.error('❌ SHEETS_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Authentication secret not configured.' 
        },
        { status: 500 }
      );
    }

    console.log('📊 Fetching fresh P&L data from Google Sheets...');
    console.log('🔐 Using secret (first 10 chars):', secret?.substring(0, 10));

    // Fetch data from Apps Script endpoint
    // IMPORTANT: Use text/plain to avoid CORS preflight redirect (Google Apps Script requirement)
    // Apps Script returns HTTP 302 redirects - we must NOT follow them automatically
    // because fetch() converts POST to GET when following redirects, losing the body
    let response = await fetch(pnlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'getPnL',
        secret: secret
      }),
      redirect: 'manual'  // Apps Script returns 302 - don't auto-follow
    });

    // Handle Apps Script 302 redirect
    if (response.status === 302) {
      const location = response.headers.get('location');
      if (location) {
        console.log('📍 Following 302 redirect...');
        response = await fetch(location);
      }
    }

    if (!response.ok) {
      console.error('❌ Apps Script returned error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText.substring(0, 200));
      return NextResponse.json(
        {
          ok: false,
          error: `Failed to fetch P&L data: ${response.statusText}`
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    if (!result.ok) {
      console.error('❌ Apps Script returned error:', result.error);
      return NextResponse.json(
        { 
          ok: false, 
          error: result.error || 'Failed to retrieve P&L data' 
        },
        { status: 500 }
      );
    }

    // Validate data structure
    if (!result.data || !result.data.month || !result.data.year) {
      console.error('❌ Invalid data structure from Apps Script');
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Invalid data structure received from P&L endpoint' 
        },
        { status: 500 }
      );
    }

    // Update cache
    cache = {
      data: result.data,
      timestamp: now
    };

    console.log('✅ P&L data fetched and cached successfully');

    // Log warnings and computed fallbacks if present
    if (result.warnings && result.warnings.length > 0) {
      console.warn('⚠️ P&L Warnings:', result.warnings);
    }

    if (result.computedFallbacks && result.computedFallbacks.length > 0) {
      console.log('→ P&L Computed Fallbacks:', result.computedFallbacks);
    }

    return NextResponse.json({
      ok: true,
      data: result.data,
      cached: false,
      warnings: result.warnings || [],
      computedFallbacks: result.computedFallbacks || [],
      matchInfo: result.matchInfo || {}
    });

  } catch (error) {
    console.error('❌ Error in P&L API route:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pnl (optional - for manual cache invalidation)
 * Clears the cache to force fresh data fetch
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'clearCache') {
      cache = null;
      console.log('🗑️ P&L cache cleared');
      return NextResponse.json({
        ok: true,
        message: 'Cache cleared successfully'
      });
    }

    return NextResponse.json(
      { 
        ok: false, 
        error: 'Unknown action' 
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Error in P&L POST route:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

