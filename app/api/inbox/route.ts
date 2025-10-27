/**
 * Inbox API Route
 * 
 * GET /api/inbox - Fetch all entries from Google Sheets
 * DELETE /api/inbox - Delete a specific entry by row number
 */

import { NextRequest, NextResponse } from 'next/server';

// Cache for inbox data (5 seconds TTL to keep it fresh)
let cache: {
  data: any[];
  timestamp: number;
} | null = null;

const CACHE_DURATION_MS = 5000; // 5 seconds

/**
 * GET /api/inbox
 * Returns all entries from Google Sheets
 */
export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const now = Date.now();
    if (cache && (now - cache.timestamp) < CACHE_DURATION_MS) {
      console.log('✅ Returning cached inbox data');
      return NextResponse.json({
        ok: true,
        data: cache.data,
        cached: true,
        cacheAge: Math.floor((now - cache.timestamp) / 1000)
      });
    }

    // Validate environment variables
    const webhookUrl = process.env.SHEETS_WEBHOOK_URL;
    const secret = process.env.SHEETS_WEBHOOK_SECRET;

    if (!webhookUrl) {
      console.error('❌ SHEETS_WEBHOOK_URL not configured');
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Webhook endpoint not configured. Please set SHEETS_WEBHOOK_URL in environment variables.' 
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

    console.log('📥 Fetching fresh inbox data from Google Sheets...');

    // Fetch data from Apps Script endpoint
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getInbox',
        secret: secret
      })
    });

    if (!response.ok) {
      console.error('❌ Apps Script returned error:', response.status, response.statusText);
      return NextResponse.json(
        { 
          ok: false, 
          error: `Failed to fetch inbox data: ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.ok) {
      console.error('❌ Apps Script returned error:', data.error);
      return NextResponse.json(
        { 
          ok: false, 
          error: data.error || 'Failed to fetch inbox data' 
        },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${data.count || 0} entries from Google Sheets`);

    // Update cache
    cache = {
      data: data.data || [],
      timestamp: now
    };

    return NextResponse.json({
      ok: true,
      data: data.data || [],
      count: data.count || 0,
      cached: false
    });

  } catch (error) {
    console.error('❌ Inbox API error:', error);
    return NextResponse.json(
      { 
        ok: false,
        error: 'Failed to fetch inbox data. Please try again.' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/inbox
 * Deletes a specific entry by row number
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { rowNumber } = body;

    if (!rowNumber) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Row number is required' 
        },
        { status: 400 }
      );
    }

    // Validate environment variables
    const webhookUrl = process.env.SHEETS_WEBHOOK_URL;
    const secret = process.env.SHEETS_WEBHOOK_SECRET;

    if (!webhookUrl || !secret) {
      console.error('❌ Webhook not configured');
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Webhook not configured' 
        },
        { status: 500 }
      );
    }

    console.log(`🗑️ Deleting entry at row ${rowNumber}...`);

    // Call Apps Script to delete the row
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'deleteEntry',
        secret: secret,
        rowNumber: rowNumber
      })
    });

    if (!response.ok) {
      console.error('❌ Apps Script returned error:', response.status, response.statusText);
      return NextResponse.json(
        { 
          ok: false, 
          error: `Failed to delete entry: ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.ok) {
      console.error('❌ Apps Script returned error:', data.error);
      return NextResponse.json(
        { 
          ok: false, 
          error: data.error || 'Failed to delete entry' 
        },
        { status: 500 }
      );
    }

    console.log(`✅ Deleted entry at row ${rowNumber}`);

    // Invalidate cache
    cache = null;

    return NextResponse.json({
      ok: true,
      success: true,
      message: 'Entry deleted successfully',
      deletedRow: rowNumber
    });

  } catch (error) {
    console.error('❌ Delete API error:', error);
    return NextResponse.json(
      { 
        ok: false,
        error: 'Failed to delete entry. Please try again.' 
      },
      { status: 500 }
    );
  }
}

