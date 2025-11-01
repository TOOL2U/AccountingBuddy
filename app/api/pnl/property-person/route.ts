import { NextRequest, NextResponse } from 'next/server';

interface PropertyPersonItem {
  name: string;
  expense: number;
  percentage: number;
}

async function fetchPropertyPersonData(period: string) {
  const scriptUrl = process.env.SHEETS_WEBHOOK_URL;
  const secret = process.env.SHEETS_WEBHOOK_SECRET;

  if (!scriptUrl || !secret) {
    throw new Error('Google Apps Script configuration missing');
  }

  console.log(`🔍 Fetching property/person data for period: ${period}`);
  console.log(`📤 Sending to Apps Script:`, {
    action: 'getPropertyPersonDetails',
    period: period,
    secret: '[REDACTED]'
  });

  // Apps Script returns HTTP 302 redirects - we must NOT follow them automatically
  // because fetch() converts POST to GET when following redirects, losing the body
  let response = await fetch(scriptUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'getPropertyPersonDetails',
      period: period,
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
    throw new Error(`Apps Script responded with status: ${response.status}`);
  }

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error || 'Apps Script returned error');
  }

  console.log(`✅ Successfully fetched ${result.data?.length || 0} property/person items`);

  return {
    ok: true,
    success: true,
    data: result.data || [],
    period: period,
    totalExpense: result.totalExpense || 0,
    timestamp: new Date().toISOString()
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    if (!period || !['month', 'year'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be "month" or "year".' },
        { status: 400 }
      );
    }

    const result = await fetchPropertyPersonData(period);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Property/Person API Error:', error);

    return NextResponse.json(
      {
        ok: false,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch property/person data',
        data: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const period = body.period || 'month';

    if (!period || !['month', 'year'].includes(period)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid period. Must be "month" or "year".'
        },
        { status: 400 }
      );
    }

    const result = await fetchPropertyPersonData(period);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Property/Person API Error:', error);

    return NextResponse.json(
      {
        ok: false,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch property/person data',
        data: []
      },
      { status: 500 }
    );
  }
}