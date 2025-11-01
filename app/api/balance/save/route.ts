import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/balance/save
 * Save balance for a specific bank or cash to Google Sheets
 *
 * New structure supports individual bank tracking:
 * - bankName: "Cash" | "Bank Transfer - Bangkok Bank - Shaun Ducker" | etc.
 * - balance: number
 * - note: optional string
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bankName, balance, note, bankBalance, cashBalance } = body;

    console.log('💰 [BALANCE SAVE] Received request:', {
      bankName,
      balance,
      note,
      bankBalance,
      cashBalance
    });

    // Support both new format (bankName + balance) and old format (bankBalance/cashBalance)
    let finalBankName: string;
    let finalBalance: number;

    if (bankName && balance !== undefined) {
      // New format
      finalBankName = bankName;
      finalBalance = balance;
      console.log('✅ [BALANCE SAVE] Using new format:', { finalBankName, finalBalance });
    } else if (bankBalance !== undefined) {
      // Old format - assume it's for a default bank
      finalBankName = 'Bank Transfer - Bangkok Bank - Shaun Ducker';
      finalBalance = bankBalance;
      console.log('⚠️ [BALANCE SAVE] Using old format (bankBalance):', { finalBankName, finalBalance });
    } else if (cashBalance !== undefined) {
      // Old format - cash
      finalBankName = 'Cash';
      finalBalance = cashBalance;
      console.log('⚠️ [BALANCE SAVE] Using old format (cashBalance):', { finalBankName, finalBalance });
    } else {
      return NextResponse.json(
        { error: 'Either (bankName + balance) or (bankBalance/cashBalance) must be provided' },
        { status: 400 }
      );
    }

    // Validate balance value
    if (typeof finalBalance !== 'number' || isNaN(finalBalance) || finalBalance < 0) {
      return NextResponse.json(
        { error: 'Invalid balance value' },
        { status: 400 }
      );
    }

    // Validate bank name
    if (!finalBankName || typeof finalBankName !== 'string') {
      return NextResponse.json(
        { error: 'Invalid bank name' },
        { status: 400 }
      );
    }

    // Get Google Sheets webhook URL
    const webhookUrl = process.env.SHEETS_BALANCES_APPEND_URL;
    const secret = process.env.SHEETS_WEBHOOK_SECRET;

    if (!webhookUrl || !secret) {
      console.error('Balance webhook not configured');
      return NextResponse.json(
        { error: 'Balance service not configured' },
        { status: 500 }
      );
    }

    // Prepare payload with new structure
    const payload: {
      action: string;
      secret: string;
      bankName: string;
      balance: number;
      note?: string;
    } = {
      action: 'balancesAppend',
      secret,
      bankName: finalBankName,
      balance: finalBalance,
    };

    if (note) {
      payload.note = note;
    }

    console.log('📤 [BALANCE SAVE] Sending to Google Sheets:', {
      action: payload.action,
      bankName: payload.bankName,
      balance: payload.balance,
      note: payload.note
    });

    // Send to Google Sheets
    // IMPORTANT: Use text/plain to avoid CORS preflight redirect (Google Apps Script requirement)
    // Note: Apps Script returns HTTP 302 redirects - let fetch follow them automatically
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
      // redirect: 'follow' is the default - fetch will automatically follow 302 redirects
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sheets webhook error:', errorText);
      return NextResponse.json(
        { error: 'Failed to save balance to Google Sheets' },
        { status: 500 }
      );
    }

    const data = await response.json();

    console.log('📥 [BALANCE SAVE] Response from Google Sheets:', data);

    if (!data.ok) {
      console.error('❌ [BALANCE SAVE] Failed:', data.error);
      return NextResponse.json(
        { error: data.error || 'Failed to save balance' },
        { status: 500 }
      );
    }

    console.log('✅ [BALANCE SAVE] Success! Saved:', finalBankName, '=', finalBalance);

    return NextResponse.json({
      ok: true,
      message: 'Balance saved successfully',
      savedData: {
        bankName: finalBankName,
        balance: finalBalance
      }
    });

  } catch (error) {
    console.error('Balance save error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to save balance',
      },
      { status: 500 }
    );
  }
}

