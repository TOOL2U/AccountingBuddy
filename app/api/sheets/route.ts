import { NextRequest, NextResponse } from 'next/server';
import { validatePayload, ReceiptPayload } from '@/utils/validatePayload';
import { matchProperty, matchTypeOfOperation, matchTypeOfPayment } from '@/utils/matchOption';

// Google Sheets webhook configuration
const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;
const SHEETS_WEBHOOK_SECRET = process.env.SHEETS_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    console.log('[SHEETS] Starting Google Sheets append...');

    // Check if webhook is configured
    if (!SHEETS_WEBHOOK_URL || !SHEETS_WEBHOOK_SECRET) {
      console.error('[✖] Google Sheets webhook not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'Google Sheets webhook not configured. Please set SHEETS_WEBHOOK_URL and SHEETS_WEBHOOK_SECRET in .env.local'
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body: ReceiptPayload = await request.json();
    console.log('[SHEETS] Received payload:', {
      day: body.day,
      month: body.month,
      year: body.year,
      property: body.property,
      typeOfOperation: body.typeOfOperation,
      detail: body.detail,
      debit: body.debit,
      credit: body.credit,
    });

    // Validate and sanitize payload
    const validation = validatePayload(body);

    if (!validation.isValid || !validation.data) {
      console.error('[✖] Payload validation failed:', validation.error);
      return NextResponse.json(
        {
          success: false,
          error: validation.error
        },
        { status: 400 }
      );
    }

    console.log('[SHEETS] Payload validated successfully');

    // Normalize dropdown fields to ensure they match canonical options
    const normalizedData = {
      ...validation.data,
      property: matchProperty(validation.data.property).value,
      typeOfOperation: matchTypeOfOperation(validation.data.typeOfOperation).value,
      typeOfPayment: matchTypeOfPayment(validation.data.typeOfPayment).value,
    };

    console.log('[SHEETS] Normalized dropdown values:', {
      property: normalizedData.property,
      typeOfOperation: normalizedData.typeOfOperation,
      typeOfPayment: normalizedData.typeOfPayment,
    });

    // Send to Google Sheets webhook
    const webhookUrl = `${SHEETS_WEBHOOK_URL}?secret=${SHEETS_WEBHOOK_SECRET}`;
    console.log('[SHEETS] Sending to webhook...');

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizedData),
    });

    // Check if webhook call was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[✖] Google Sheets webhook error:', response.status, errorText);

      // Check for unauthorized (wrong secret)
      if (response.status === 401 || errorText.includes('Unauthorized')) {
        console.error('[✖] Webhook authentication failed - check SHEETS_WEBHOOK_SECRET');
        return NextResponse.json(
          {
            success: false,
            error: 'Webhook authentication failed. Please check your SHEETS_WEBHOOK_SECRET.'
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send data to Google Sheets. Please try again.'
        },
        { status: 500 }
      );
    }

    const responseText = await response.text();
    console.log('[SHEETS] Webhook response:', responseText);

    // Try to parse as JSON first (modern Apps Script might return JSON)
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      // Handle JSON response format
      if (responseData.ok === false || responseData.error) {
        console.error('[✖] Webhook returned error:', responseData.error || 'Unknown error');
        return NextResponse.json(
          {
            success: false,
            error: responseData.error === 'Unauthorized' 
              ? 'Webhook authentication failed. Please check your SHEETS_WEBHOOK_SECRET.'
              : 'Unexpected response from Google Sheets webhook.'
          },
          { status: responseData.error === 'Unauthorized' ? 401 : 500 }
        );
      }
      // Check for success in JSON format
      if (responseData.ok === true || responseData.success) {
        console.log('[✔] Sheets append → status: SUCCESS (JSON format)');
        console.log('✅ Accounting Buddy Receipt Upload Complete — Data appended to Google Sheets');
        return NextResponse.json({
          success: true,
          message: 'Receipt added to Google Sheet successfully',
        });
      }
    } catch (jsonError) {
      // Not JSON, fall back to text parsing
      console.log('[SHEETS] Response is not JSON, parsing as text');
    }

    // Check if Apps Script returned success (plain text format)
    if (responseText.includes('Success')) {
      console.log('[✔] Sheets append → status: SUCCESS (text format)');
      console.log('✅ Accounting Buddy Receipt Upload Complete — Data appended to Google Sheets');
      return NextResponse.json({
        success: true,
        message: 'Receipt added to Google Sheet successfully',
      });
    }

    // If we get here, it's an unexpected response
    console.error('[✖] Unexpected webhook response:', responseText);
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected response from Google Sheets webhook.'
      },
      { status: 500 }
    );

  } catch (error) {
    console.error('Sheets API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send data to Google Sheets. Please try again.' 
      },
      { status: 500 }
    );
  }
}

