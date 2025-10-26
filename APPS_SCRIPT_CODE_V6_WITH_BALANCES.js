/**
 * Google Apps Script - Accounting Buddy Webhook + P&L + Balance Endpoints
 * Version 6: Adds Balance Management to V5
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open your existing Apps Script project (script.google.com)
 * 2. REPLACE the existing code with this file
 * 3. Create a new sheet named "Balances" with columns: timestamp, bankBalance, cashBalance, note
 * 4. (Optional) Create named ranges: Month_Net_Cash, Year_Net_Cash for reconciliation
 * 5. Click "Deploy" → "Manage deployments"
 * 6. Click "Edit" (pencil icon) on your existing deployment
 * 7. Click "Deploy"
 * 8. The URL stays the same - no need to update SHEETS_WEBHOOK_URL!
 * 9. Update .env.local with:
 *    SHEETS_BALANCES_APPEND_URL=<your_deployment_url>
 *    SHEETS_BALANCES_GET_URL=<your_deployment_url>
 * 
 * NEW FEATURES IN V6:
 * ✨ Balance tracking (bank + cash)
 * ✨ Automatic balance history
 * ✨ P&L reconciliation (net cash vs actual balances)
 * ✨ Fallback to previous values if only one balance updated
 * 
 * ENDPOINTS:
 * - Webhook: POST with accounting data (day, month, year, etc.)
 * - P&L: POST with { action: "getPnL", secret: "..." }
 * - Balance Append: POST with { action: "appendBalance", bankBalance?, cashBalance?, note?, secret }
 * - Balance Get: POST with { action: "getBalance", secret }
 * - Discovery: POST with { action: "list_named_ranges", secret: "..." }
 */

// ============================================================================
// Configuration
// ============================================================================
const EXPECTED_SECRET = "VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=";
const CACHE_TTL_SECONDS = 60;
const BALANCES_SHEET_NAME = 'Balances';

// ============================================================================
// Balance Management Functions
// ============================================================================

/**
 * Get or create the Balances sheet
 */
function getBalancesSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(BALANCES_SHEET_NAME);
  
  if (!sheet) {
    Logger.log('Creating new Balances sheet...');
    sheet = ss.insertSheet(BALANCES_SHEET_NAME);
    
    const headers = ['timestamp', 'bankBalance', 'cashBalance', 'note'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#4a5568')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    
    Logger.log('✓ Balances sheet created');
  }
  
  return sheet;
}

/**
 * Get the latest balance values
 */
function getLatestBalances_() {
  const sheet = getBalancesSheet_();
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return {
      timestamp: new Date().toISOString(),
      bankBalance: 0,
      cashBalance: 0,
      note: ''
    };
  }
  
  const values = sheet.getRange(lastRow, 1, 1, 4).getValues()[0];
  
  return {
    timestamp: values[0] ? new Date(values[0]).toISOString() : new Date().toISOString(),
    bankBalance: parseFloat(values[1]) || 0,
    cashBalance: parseFloat(values[2]) || 0,
    note: values[3] || ''
  };
}

/**
 * Get balance history (last N entries)
 */
function getBalanceHistory_(limit) {
  const sheet = getBalancesSheet_();
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return [];
  }
  
  const numRows = Math.min(limit || 5, lastRow - 1);
  const startRow = lastRow - numRows + 1;
  const values = sheet.getRange(startRow, 1, numRows, 4).getValues();
  
  return values.map(function(row) {
    return {
      timestamp: row[0] ? new Date(row[0]).toISOString() : '',
      bankBalance: parseFloat(row[1]) || 0,
      cashBalance: parseFloat(row[2]) || 0,
      note: row[3] || ''
    };
  }).reverse();
}

/**
 * Append a new balance entry
 */
function appendBalance_(bankBalance, cashBalance, note) {
  const sheet = getBalancesSheet_();
  const latest = getLatestBalances_();
  
  const finalBankBalance = bankBalance !== undefined && bankBalance !== null 
    ? parseFloat(bankBalance) 
    : latest.bankBalance;
    
  const finalCashBalance = cashBalance !== undefined && cashBalance !== null 
    ? parseFloat(cashBalance) 
    : latest.cashBalance;
  
  const timestamp = new Date();
  sheet.appendRow([
    timestamp,
    finalBankBalance,
    finalCashBalance,
    note || ''
  ]);
  
  Logger.log('✓ Balance appended: Bank=' + finalBankBalance + ', Cash=' + finalCashBalance);
  
  return {
    timestamp: timestamp.toISOString(),
    bankBalance: finalBankBalance,
    cashBalance: finalCashBalance,
    note: note || ''
  };
}

/**
 * Get reconciliation data (net cash from P&L)
 */
function getReconciliationData_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const namedRanges = ss.getNamedRanges();
  const rangeMap = {};
  
  namedRanges.forEach(function(nr) {
    const range = nr.getRange();
    rangeMap[nr.getName()] = range.getValue();
  });
  
  let monthNetCash = null;
  let yearNetCash = null;
  
  const monthPatterns = ['Month_Net_Cash', 'MonthNetCash', 'Month_Cash'];
  for (let i = 0; i < monthPatterns.length; i++) {
    if (rangeMap[monthPatterns[i]] !== undefined) {
      monthNetCash = parseFloat(rangeMap[monthPatterns[i]]) || 0;
      break;
    }
  }
  
  const yearPatterns = ['Year_Net_Cash', 'YearNetCash', 'YTD_Net_Cash'];
  for (let i = 0; i < yearPatterns.length; i++) {
    if (rangeMap[yearPatterns[i]] !== undefined) {
      yearNetCash = parseFloat(rangeMap[yearPatterns[i]]) || 0;
      break;
    }
  }
  
  if (monthNetCash === null) {
    const monthRevenue = rangeMap['Month_Total_Revenue'] || rangeMap['MonthRevenue'] || 0;
    const monthOverheads = rangeMap['Month_Total_Overheads'] || rangeMap['MonthOverheads'] || 0;
    monthNetCash = parseFloat(monthRevenue) - parseFloat(monthOverheads);
  }
  
  if (yearNetCash === null) {
    const yearRevenue = rangeMap['Year_Total_Revenue'] || rangeMap['YearRevenue'] || 0;
    const yearOverheads = rangeMap['Year_Total_Overheads'] || rangeMap['YearOverheads'] || 0;
    yearNetCash = parseFloat(yearRevenue) - parseFloat(yearOverheads);
  }
  
  return {
    monthNetCash: monthNetCash || 0,
    yearNetCash: yearNetCash || 0
  };
}

// ============================================================================
// Balance Endpoint Handlers
// ============================================================================

function handleAppendBalance_(payload) {
  Logger.log('=== Append Balance Request ===');
  
  const result = appendBalance_(
    payload.bankBalance,
    payload.cashBalance,
    payload.note
  );
  
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      data: result
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleGetBalance_(payload) {
  Logger.log('=== Get Balance Request ===');
  
  const latest = getLatestBalances_();
  const reconcile = getReconciliationData_();
  const history = getBalanceHistory_(5);
  
  return ContentService
    .createTextOutput(JSON.stringify({
      latest: latest,
      reconcile: reconcile,
      history: history
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// Error Response Helper
// ============================================================================
function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: false,
      error: message
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// doPost - Main router (UPDATED with balance endpoints)
// ============================================================================
function doPost(e) {
  try {
    Logger.log('=== Incoming POST Request ===');

    if (!e.postData || !e.postData.contents) {
      return createErrorResponse('No POST data received');
    }

    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createErrorResponse('Invalid JSON in POST body');
    }

    const incomingSecret = payload.secret;

    if (incomingSecret !== EXPECTED_SECRET) {
      Logger.log('ERROR: Authentication failed');
      return createErrorResponse('Unauthorized');
    }

    Logger.log('✓ Authentication successful');

    // Route based on action
    if (payload.action === 'getPnL') {
      Logger.log('→ Routing to P&L endpoint');
      return handleGetPnL();
    } else if (payload.action === 'list_named_ranges') {
      Logger.log('→ Routing to discovery endpoint');
      return handleDiscoverRanges();
    } else if (payload.action === 'appendBalance') {
      Logger.log('→ Routing to append balance endpoint');
      return handleAppendBalance_(payload);
    } else if (payload.action === 'getBalance') {
      Logger.log('→ Routing to get balance endpoint');
      return handleGetBalance_(payload);
    } else if (payload.day && payload.month && payload.year) {
      Logger.log('→ Routing to webhook endpoint');
      return handleWebhook(payload);
    } else {
      return createErrorResponse('Unknown request type');
    }

  } catch (error) {
    Logger.log('ERROR in doPost: ' + error.toString());
    return createErrorResponse('Internal server error: ' + error.toString());
  }
}

// NOTE: The rest of the V5 code (handleWebhook, handleGetPnL, handleDiscoverRanges, 
// named range discovery functions, etc.) should be copied from APPS_SCRIPT_CODE_V5_DYNAMIC_PNL.js
// This file shows the key additions for balance management.

