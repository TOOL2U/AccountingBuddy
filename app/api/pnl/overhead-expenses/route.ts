import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') as 'month' | 'year' | null;

  if (!period || !['month', 'year'].includes(period)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid period parameter. Must be "month" or "year".' },
      { status: 400 }
    );
  }

  const scriptUrl = process.env.SHEETS_WEBHOOK_URL;
  const secret = process.env.SHEETS_WEBHOOK_SECRET;

  if (!scriptUrl) {
    console.error('❌ SHEETS_WEBHOOK_URL is not defined in environment variables');
    return NextResponse.json(
      { ok: false, error: 'Apps Script URL not configured. Please set SHEETS_WEBHOOK_URL in environment variables.' },
      { status: 500 }
    );
  }

  if (!secret) {
    console.error('❌ SHEETS_WEBHOOK_SECRET is not defined in environment variables');
    return NextResponse.json(
      { ok: false, error: 'Webhook secret not configured. Please set SHEETS_WEBHOOK_SECRET in environment variables.' },
      { status: 500 }
    );
  }

  try {
    let response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getOverheadExpensesDetails',
        secret: secret,
        period,
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
      throw new Error(`Apps Script responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      ok: true,
      data: data.data || [],
      period,
      totalExpense: data.totalExpense || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching overhead expenses details:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch overhead expenses data' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period } = body;

    if (!period || !['month', 'year'].includes(period)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid period parameter. Must be "month" or "year".' },
        { status: 400 }
      );
    }

    const scriptUrl = process.env.SHEETS_WEBHOOK_URL;
    const secret = process.env.SHEETS_WEBHOOK_SECRET;

    if (!scriptUrl) {
      console.error('❌ SHEETS_WEBHOOK_URL is not defined in environment variables');
      return NextResponse.json(
        { ok: false, error: 'Apps Script URL not configured. Please set SHEETS_WEBHOOK_URL in environment variables.' },
        { status: 500 }
      );
    }

    if (!secret) {
      console.error('❌ SHEETS_WEBHOOK_SECRET is not defined in environment variables');
      return NextResponse.json(
        { ok: false, error: 'Webhook secret not configured. Please set SHEETS_WEBHOOK_SECRET in environment variables.' },
        { status: 500 }
      );
    }

    let response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getOverheadExpensesDetails',
        secret: secret,
        period,
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
      throw new Error(`Apps Script responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      ok: true,
      data: data.data || [],
      period,
      totalExpense: data.totalExpense || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching overhead expenses details:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch overhead expenses data' 
      },
      { status: 500 }
    );
  }
}
