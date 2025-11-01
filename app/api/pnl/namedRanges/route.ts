/**
 * Admin endpoint to discover and list all named ranges from Google Sheets
 * 
 * GET /api/pnl/namedRanges
 * 
 * This endpoint calls the Apps Script discovery endpoint to fetch all named ranges
 * and returns them in a formatted JSON response for debugging and verification.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('[NAMED_RANGES] Discovery request received');
    
    // Get environment variables
    const pnlUrl = process.env.SHEETS_PNL_URL;
    const secret = process.env.SHEETS_WEBHOOK_SECRET;
    
    // Validate configuration
    if (!pnlUrl) {
      console.error('[NAMED_RANGES] SHEETS_PNL_URL not configured');
      return NextResponse.json({
        ok: false,
        error: 'P&L endpoint not configured. Please set SHEETS_PNL_URL in environment variables.'
      }, { status: 500 });
    }
    
    if (!secret) {
      console.error('[NAMED_RANGES] SHEETS_WEBHOOK_SECRET not configured');
      return NextResponse.json({
        ok: false,
        error: 'Webhook secret not configured. Please set SHEETS_WEBHOOK_SECRET in environment variables.'
      }, { status: 500 });
    }
    
    console.log('[NAMED_RANGES] Calling Apps Script discovery endpoint...');
    console.log('[NAMED_RANGES] URL:', pnlUrl);
    
    // Call Apps Script discovery endpoint
    let response = await fetch(pnlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'list_named_ranges',
        secret: secret
      }),
      redirect: 'manual'  // Don't follow 302 redirects (Apps Script returns 302 with data)
    });

    console.log('[NAMED_RANGES] Apps Script response status:', response.status);

    // Handle 302 redirect from Apps Script (normal behavior)
    if (response.status === 302) {
      const location = response.headers.get('location');
      if (location) {
        console.log('📍 Following redirect to cached response...');
        response = await fetch(location);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[NAMED_RANGES] Apps Script error:', errorText);
      return NextResponse.json({
        ok: false,
        error: `Apps Script returned ${response.status}: ${errorText}`
      }, { status: response.status });
    }
    
    // Parse response
    const result = await response.json();
    
    console.log('[NAMED_RANGES] Discovery successful');
    console.log('[NAMED_RANGES] Total ranges:', result.totalRanges);
    console.log('[NAMED_RANGES] P&L-related ranges:', result.pnlRelatedCount);
    
    // Return formatted response
    return NextResponse.json({
      ok: true,
      ...result,
      endpoint: pnlUrl,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('[NAMED_RANGES] Error:', error);
    return NextResponse.json({
      ok: false,
      error: error.message || 'Failed to discover named ranges'
    }, { status: 500 });
  }
}

/**
 * POST endpoint to clear cache and force fresh discovery
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[NAMED_RANGES] Force refresh request received');
    
    // Get environment variables
    const pnlUrl = process.env.SHEETS_PNL_URL;
    const secret = process.env.SHEETS_WEBHOOK_SECRET;
    
    if (!pnlUrl || !secret) {
      return NextResponse.json({
        ok: false,
        error: 'Configuration missing'
      }, { status: 500 });
    }
    
    // Note: Apps Script cache is managed server-side
    // This endpoint just forces a fresh fetch by calling the discovery endpoint
    
    console.log('[NAMED_RANGES] Calling Apps Script discovery endpoint (fresh)...');
    
    let response = await fetch(pnlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'list_named_ranges',
        secret: secret
      }),
      redirect: 'manual'  // Don't follow 302 redirects (Apps Script returns 302 with data)
    });

    // Handle 302 redirect from Apps Script (normal behavior)
    if (response.status === 302) {
      const location = response.headers.get('location');
      if (location) {
        console.log('📍 Following redirect to cached response...');
        response = await fetch(location);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[NAMED_RANGES] Apps Script error:', errorText);
      return NextResponse.json({
        ok: false,
        error: `Apps Script returned ${response.status}: ${errorText}`
      }, { status: response.status });
    }
    
    const result = await response.json();
    
    console.log('[NAMED_RANGES] Fresh discovery successful');
    
    return NextResponse.json({
      ok: true,
      ...result,
      refreshed: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('[NAMED_RANGES] Error:', error);
    return NextResponse.json({
      ok: false,
      error: error.message || 'Failed to refresh named ranges'
    }, { status: 500 });
  }
}

