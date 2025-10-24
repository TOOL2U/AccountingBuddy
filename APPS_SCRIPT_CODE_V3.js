/**
 * Google Apps Script - Accounting Buddy Webhook
 * Version 3: POST Body Authentication
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open Google Apps Script Editor (script.google.com)
 * 2. Create a new project or open existing one
 * 3. Replace all code with this file
 * 4. Click "Deploy" → "New deployment"
 * 5. Settings:
 *    - Type: Web app
 *    - Execute as: Me (your Google account)
 *    - Who has access: Anyone
 * 6. Click "Deploy"
 * 7. Copy the deployment URL
 * 8. Update SHEETS_WEBHOOK_URL in Vercel environment variables
 * 
 * IMPORTANT: Make sure to use the NEW deployment URL after deploying!
 */

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Accounting Buddy webhook is running',
      version: '3.0 - POST body authentication',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    // Expected secret (must match SHEETS_WEBHOOK_SECRET in .env.local)
    const EXPECTED_SECRET = "VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=";
    
    // Log incoming request for debugging
    Logger.log('=== Incoming POST Request ===');
    Logger.log('Has postData: ' + !!(e.postData && e.postData.contents));
    
    // Check if POST data exists
    if (!e.postData || !e.postData.contents) {
      Logger.log('ERROR: No POST data received');
      return ContentService
        .createTextOutput(JSON.stringify({
          ok: false,
          error: 'No POST data received'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Parse the POST body
    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
      Logger.log('Payload parsed successfully');
      Logger.log('Payload keys: ' + Object.keys(payload).join(', '));
    } catch (parseError) {
      Logger.log('ERROR: Failed to parse JSON: ' + parseError.toString());
      return ContentService
        .createTextOutput(JSON.stringify({
          ok: false,
          error: 'Invalid JSON in POST body'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Verify secret from POST body
    const incomingSecret = payload.secret;
    Logger.log('Has secret in payload: ' + !!incomingSecret);
    Logger.log('Secret matches: ' + (incomingSecret === EXPECTED_SECRET));
    
    if (incomingSecret !== EXPECTED_SECRET) {
      Logger.log('ERROR: Authentication failed - invalid or missing secret');
      return ContentService
        .createTextOutput(JSON.stringify({
          ok: false,
          error: 'Unauthorized'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    Logger.log('✓ Authentication successful');
    
    // Remove secret from payload before processing
    delete payload.secret;
    
    // Validate required fields
    const requiredFields = ['day', 'month', 'year', 'property', 'typeOfOperation', 'typeOfPayment', 'detail'];
    const missingFields = requiredFields.filter(field => !payload[field]);
    
    if (missingFields.length > 0) {
      Logger.log('ERROR: Missing required fields: ' + missingFields.join(', '));
      return ContentService
        .createTextOutput(JSON.stringify({
          ok: false,
          error: 'Missing required fields: ' + missingFields.join(', ')
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    Logger.log('✓ All required fields present');
    
    // Get the active spreadsheet and sheet
    // IMPORTANT: Make sure this script is bound to your spreadsheet
    // or use SpreadsheetApp.openById('YOUR_SPREADSHEET_ID')
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Accounting Buddy P&L 2025');

    if (!sheet) {
      Logger.log('ERROR: Sheet "Accounting Buddy P&L 2025" not found');
      return ContentService
        .createTextOutput(JSON.stringify({
          ok: false,
          error: 'Sheet "Accounting Buddy P&L 2025" not found in spreadsheet'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    Logger.log('✓ Sheet "Accounting Buddy P&L 2025" found');
    
    // Format the date
    const dateStr = `${payload.day}/${payload.month}/${payload.year}`;
    
    // Prepare row data (Column A is empty, data goes in B-K)
    const rowData = [
      '', // Column A - Empty (for row numbers or manual use)
      dateStr, // Column B - Date
      payload.property || '', // Column C - Property
      payload.typeOfOperation || '', // Column D - Type of Operation
      payload.typeOfPayment || '', // Column E - Type of Payment
      payload.detail || '', // Column F - Detail
      payload.ref || '', // Column G - Ref
      payload.debit || '', // Column H - Debit
      payload.credit || '' // Column I - Credit
    ];
    
    Logger.log('Row data prepared: ' + JSON.stringify(rowData));
    
    // Append the row to the sheet
    sheet.appendRow(rowData);
    
    Logger.log('✓ Data appended successfully to row ' + sheet.getLastRow());
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        success: true,
        message: 'Data appended successfully',
        row: sheet.getLastRow(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log the error
    Logger.log('ERROR: Unexpected error: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: 'Internal server error: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify the script works
 * Run this in the Apps Script editor to test
 */
function testDoPost() {
  const testPayload = {
    secret: "VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=",
    day: "27",
    month: "Feb",
    year: "2025",
    property: "Sia Moon",
    typeOfOperation: "EXP - Construction - Materials",
    typeOfPayment: "Cash",
    detail: "Test receipt from Apps Script",
    ref: "TEST-001",
    debit: 1000,
    credit: 0
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testPayload)
    }
  };
  
  const response = doPost(mockEvent);
  Logger.log('Test response: ' + response.getContent());
}

