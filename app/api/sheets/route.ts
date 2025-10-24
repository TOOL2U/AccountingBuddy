import { NextRequest, NextResponse } from 'next/server';
import { validatePayload, ReceiptPayload } from '@/utils/validatePayload';

// Google Sheets webhook configuration
const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;
const SHEETS_WEBHOOK_SECRET = process.env.SHEETS_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Check if webhook is configured
    if (!SHEETS_WEBHOOK_URL || !SHEETS_WEBHOOK_SECRET) {
      console.error('Google Sheets webhook not configured');
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

    // Validate and sanitize payload
    const validation = validatePayload(body);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false,
          error: validation.error 
        },
        { status: 400 }
      );
    }

    // Send to Google Sheets webhook
    const webhookUrl = `${SHEETS_WEBHOOK_URL}?secret=${SHEETS_WEBHOOK_SECRET}`;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.data),
    });

    // Check if webhook call was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets webhook error:', response.status, errorText);
      
      // Check for unauthorized (wrong secret)
      if (response.status === 401 || errorText.includes('Unauthorized')) {
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
    
    // Check if Apps Script returned success
    if (!responseText.includes('Success')) {
      console.error('Unexpected webhook response:', responseText);
      return NextResponse.json(
        { 
          success: false,
          error: 'Unexpected response from Google Sheets webhook.' 
        },
        { status: 500 }
      );
    }

    // Success!
    return NextResponse.json({
      success: true,
      message: 'Receipt added to Google Sheet successfully',
    });

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

