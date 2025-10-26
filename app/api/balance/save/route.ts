import { NextRequest, NextResponse } from 'next/server';

const SHEETS_BALANCES_APPEND_URL = process.env.SHEETS_BALANCES_APPEND_URL;
const SHEETS_WEBHOOK_SECRET = process.env.SHEETS_WEBHOOK_SECRET;

interface SaveBalanceRequest {
  bankBalance?: number;
  cashBalance?: number;
  note?: string;
}

/**
 * POST /api/balance/save
 * Save bank and/or cash balance to Google Sheets
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[BALANCE SAVE] Starting balance save...');

    // Check if webhook is configured
    if (!SHEETS_BALANCES_APPEND_URL || !SHEETS_WEBHOOK_SECRET) {
      console.error('[✖] Balance webhook not configured');
      return NextResponse.json(
        {
          ok: false,
          error: 'Balance webhook not configured. Please set SHEETS_BALANCES_APPEND_URL and SHEETS_WEBHOOK_SECRET in .env.local'
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body: SaveBalanceRequest = await request.json();
    console.log('[BALANCE SAVE] Received payload:', {
      bankBalance: body.bankBalance,
      cashBalance: body.cashBalance,
      note: body.note,
    });

    // Validate that at least one balance is provided
    if (body.bankBalance === undefined && body.cashBalance === undefined) {
      return NextResponse.json(
        {
          ok: false,
          error: 'At least one balance (bank or cash) must be provided'
        },
        { status: 400 }
      );
    }

    // Validate balance values if provided
    if (body.bankBalance !== undefined && (isNaN(body.bankBalance) || body.bankBalance < 0)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Bank balance must be a valid non-negative number'
        },
        { status: 400 }
      );
    }

    if (body.cashBalance !== undefined && (isNaN(body.cashBalance) || body.cashBalance < 0)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Cash balance must be a valid non-negative number'
        },
        { status: 400 }
      );
    }

    // Send to Google Sheets webhook
    console.log('[BALANCE SAVE] Sending to webhook...');

    const response = await fetch(SHEETS_BALANCES_APPEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bankBalance: body.bankBalance,
        cashBalance: body.cashBalance,
        note: body.note || '',
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
            ok: false,
            error: 'Webhook authentication failed. Please check your SHEETS_WEBHOOK_SECRET.'
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to save balance to Google Sheets. Please try again.'
        },
        { status: 500 }
      );
    }

    const responseText = await response.text();
    console.log('[BALANCE SAVE] Webhook response:', responseText);

    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      
      // Check for error in JSON response
      if (responseData.ok === false || responseData.error) {
        console.error('[✖] Webhook returned error:', responseData.error || 'Unknown error');
        return NextResponse.json(
          {
            ok: false,
            error: responseData.error === 'Unauthorized' 
              ? 'Webhook authentication failed. Please check your SHEETS_WEBHOOK_SECRET.'
              : 'Failed to save balance to Google Sheets.'
          },
          { status: responseData.error === 'Unauthorized' ? 401 : 500 }
        );
      }
      
      // Success in JSON format
      if (responseData.ok === true) {
        console.log('[✔] Balance saved successfully (JSON format)');
        return NextResponse.json({
          ok: true,
          message: 'Balance saved to Google Sheets successfully',
        });
      }
    } catch (jsonError) {
      // Not JSON, fall back to text parsing
      console.log('[BALANCE SAVE] Response is not JSON, parsing as text');
    }

    // Check if Apps Script returned success (plain text format)
    if (responseText.includes('Success') || responseText.includes('ok')) {
      console.log('[✔] Balance saved successfully (text format)');
      return NextResponse.json({
        ok: true,
        message: 'Balance saved to Google Sheets successfully',
      });
    }

    // If we get here, it's an unexpected response
    console.error('[✖] Unexpected webhook response:', responseText);
    return NextResponse.json(
      {
        ok: false,
        error: 'Unexpected response from Google Sheets webhook.'
      },
      { status: 500 }
    );

  } catch (error) {
    console.error('[✖] Balance save API error:', error);
    return NextResponse.json(
      { 
        ok: false,
        error: 'Failed to save balance. Please try again.' 
      },
      { status: 500 }
    );
  }
}

