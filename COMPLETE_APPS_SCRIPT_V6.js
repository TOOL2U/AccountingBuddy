/**
 * Google Apps Script - Accounting Buddy COMPLETE V6
 * Version 6: Webhook + P&L + Inbox + Delete
 * 
 * 🚀 SIMPLE DEPLOYMENT:
 * 1. Copy this ENTIRE file
 * 2. Go to script.google.com
 * 3. Open your Apps Script project
 * 4. Select ALL existing code and DELETE it
 * 5. Paste this ENTIRE file
 * 6. Click "Deploy" → "Manage deployments" → "Edit" → "Deploy"
 * 7. Done! URL stays the same.
 * 
 * ENDPOINTS:
 * - Webhook: POST with accounting data (day, month, year, etc.)
 * - P&L: POST with { action: "getPnL", secret: "..." }
 * - Inbox: POST with { action: "getInbox", secret: "..." }
 * - Delete: POST with { action: "deleteEntry", secret: "...", rowNumber: 10 }
 * - Discovery: POST with { action: "list_named_ranges", secret: "..." }
 */

// ============================================================================
// Configuration
// ============================================================================
const EXPECTED_SECRET = "VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=";
const CACHE_TTL_SECONDS = 60;
const SHEET_NAME = 'Accounting Buddy P&L 2025';
const HEADER_ROW = 6; // Data starts from row 6

// ============================================================================
// Main Entry Point - doPost
// ============================================================================
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const providedSecret = payload.secret;

    // Verify secret
    if (providedSecret !== EXPECTED_SECRET) {
      Logger.log('ERROR: Invalid secret');
      return createErrorResponse('Unauthorized', 401);
    }

    // Route based on action
    const action = payload.action;

    if (action === 'getPnL') {
      return handleGetPnL();
    } else if (action === 'getInbox') {
      return handleGetInbox();
    } else if (action === 'deleteEntry') {
      return handleDeleteEntry(payload.rowNumber);
    } else if (action === 'list_named_ranges') {
      return handleDiscoverRanges();
    } else if (!action) {
      // No action = webhook (append data)
      return handleWebhook(payload);
    } else {
      return createErrorResponse('Unknown action: ' + action);
    }

  } catch (error) {
    Logger.log('ERROR in doPost: ' + error.toString());
    return createErrorResponse('Server error: ' + error.toString());
  }
}

// ============================================================================
// doGet - Health check endpoint
// ============================================================================
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Accounting Buddy webhook + P&L + Inbox endpoint is running',
      version: '6.0 - Complete with Inbox',
      timestamp: new Date().toISOString(),
      endpoints: {
        webhook: 'POST with accounting data',
        pnl: 'POST with { action: "getPnL", secret: "..." }',
        inbox: 'POST with { action: "getInbox", secret: "..." }',
        delete: 'POST with { action: "deleteEntry", secret: "...", rowNumber: 10 }',
        discover: 'POST with { action: "list_named_ranges", secret: "..." }'
      },
      sheetName: SHEET_NAME,
      headerRow: HEADER_ROW
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// NEW: handleGetInbox - Get all entries from the sheet
// ============================================================================
function handleGetInbox() {
  try {
    Logger.log('=== Inbox Data Request ===');

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return createErrorResponse('Sheet "' + SHEET_NAME + '" not found');
    }

    // Get all data starting from HEADER_ROW
    const lastRow = sheet.getLastRow();
    
    if (lastRow < HEADER_ROW) {
      // No data yet
      return ContentService
        .createTextOutput(JSON.stringify({
          ok: true,
          data: [],
          count: 0,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Get data range (columns A-K, from HEADER_ROW to lastRow)
    const dataRange = sheet.getRange(HEADER_ROW, 1, lastRow - HEADER_ROW + 1, 11);
    const values = dataRange.getValues();

    // Convert to array of objects
    const entries = [];
    
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const rowNumber = HEADER_ROW + i;
      
      // Skip empty rows (check if all important fields are empty)
      if (!row[1] && !row[2] && !row[3] && !row[7]) {
        continue;
      }

      entries.push({
        rowNumber: rowNumber,
        id: 'row-' + rowNumber,
        day: row[1] || '',
        month: row[2] || '',
        year: row[3] || '',
        property: row[4] || '',
        typeOfOperation: row[5] || '',
        typeOfPayment: row[6] || '',
        detail: row[7] || '',
        ref: row[8] || '',
        debit: row[9] || 0,
        credit: row[10] || 0,
        date: formatDate_(row[1], row[2], row[3]),
        amount: row[9] || row[10] || 0,
        status: 'sent' // All entries in sheet are considered "sent"
      });
    }

    Logger.log('✓ Found ' + entries.length + ' entries');

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        data: entries,
        count: entries.length,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('ERROR in handleGetInbox: ' + error.toString());
    return createErrorResponse('Inbox error: ' + error.toString());
  }
}

// ============================================================================
// NEW: handleDeleteEntry - Delete a specific row from the sheet
// ============================================================================
function handleDeleteEntry(rowNumber) {
  try {
    Logger.log('=== Delete Entry Request ===');
    Logger.log('Row number: ' + rowNumber);

    if (!rowNumber || rowNumber < HEADER_ROW) {
      return createErrorResponse('Invalid row number');
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return createErrorResponse('Sheet "' + SHEET_NAME + '" not found');
    }

    const lastRow = sheet.getLastRow();
    if (rowNumber > lastRow) {
      return createErrorResponse('Row number out of range');
    }

    // Delete the row
    sheet.deleteRow(rowNumber);
    Logger.log('✓ Deleted row ' + rowNumber);

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        success: true,
        message: 'Entry deleted successfully',
        deletedRow: rowNumber,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('ERROR in handleDeleteEntry: ' + error.toString());
    return createErrorResponse('Delete error: ' + error.toString());
  }
}

// ============================================================================
// Helper: Format date from day, month, year
// ============================================================================
function formatDate_(day, month, year) {
  if (!day || !month || !year) return '';
  
  // Convert month name to number
  const monthMap = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  
  const monthNum = monthMap[month] || month;
  const dayStr = String(day).padStart(2, '0');
  
  return dayStr + '/' + monthNum + '/' + year;
}

// ============================================================================
// Helper: Create error response
// ============================================================================
function createErrorResponse(message, statusCode) {
  statusCode = statusCode || 400;
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: false,
      error: message,
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// handleWebhook - Process accounting data (append to sheet)
// ============================================================================
function handleWebhook(payload) {
  try {
    delete payload.secret;

    const requiredFields = ['day', 'month', 'year', 'property', 'typeOfOperation', 'typeOfPayment', 'detail'];
    const missingFields = requiredFields.filter(function(field) { return !payload[field]; });

    if (missingFields.length > 0) {
      Logger.log('ERROR: Missing fields: ' + missingFields.join(', '));
      return createErrorResponse('Missing required fields: ' + missingFields.join(', '));
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return createErrorResponse('Sheet "' + SHEET_NAME + '" not found');
    }

    const rowData = [
      '',
      payload.day || '',
      payload.month || '',
      payload.year || '',
      payload.property || '',
      payload.typeOfOperation || '',
      payload.typeOfPayment || '',
      payload.detail || '',
      payload.ref || '',
      payload.debit || '',
      payload.credit || ''
    ];

    sheet.appendRow(rowData);
    Logger.log('✓ Data appended to row ' + sheet.getLastRow());

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
    Logger.log('ERROR in handleWebhook: ' + error.toString());
    return createErrorResponse('Webhook error: ' + error.toString());
  }
}

