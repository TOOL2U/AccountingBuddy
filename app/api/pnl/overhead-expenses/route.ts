import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

if (!APPS_SCRIPT_URL) {
  console.error('❌ APPS_SCRIPT_URL is not defined in environment variables');
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') as 'month' | 'year' | null;

  if (!period || !['month', 'year'].includes(period)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid period parameter. Must be "month" or "year".' },
      { status: 400 }
    );
  }

  if (!APPS_SCRIPT_URL) {
    return NextResponse.json(
      { ok: false, error: 'Apps Script URL not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getOverheadExpensesDetails',
        secret: process.env.APPS_SCRIPT_SECRET || '',
        period,
      }),
    });

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

    if (!APPS_SCRIPT_URL) {
      return NextResponse.json(
        { ok: false, error: 'Apps Script URL not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getOverheadExpensesDetails',
        secret: process.env.APPS_SCRIPT_SECRET || '',
        period,
      }),
    });

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
