/**
 * Google Apps Script - Accounting Buddy Balance Endpoints
 * 
 * Add these functions to your existing Apps Script project.
 * These work alongside the existing webhook and P&L endpoints.
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open your existing Apps Script project (script.google.com)
 * 2. ADD this code to your existing script (don't replace!)
 * 3. Create a new "Balances" sheet with columns: timestamp, bankBalance, cashBalance, note
 * 4. The existing doPost function will need to be updated to route balance requests
 * 5. Deploy as web app (same deployment as existing webhook)
 * 
 * NEW ENDPOINTS:
 * - Balance Append: POST with { action: "appendBalance", bankBalance?, cashBalance?, note?, secret }
 * - Balance Get: POST with { action: "getBalance", secret }
 * 
 * NAMED RANGES (optional, for reconciliation):
 * - Month_Net_Cash: Net cash movement for current month
 * - Year_Net_Cash: Net cash movement YTD
 * If not available, will compute from Revenue - Overheads
 */

// ============================================================================
// Balance Sheet Configuration
// ============================================================================
const BALANCES_SHEET_NAME = 'Balances';

/**
 * Get or create the Balances sheet
 */
function getBalancesSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(BALANCES_SHEET_NAME);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    Logger.log('Creating new Balances sheet...');
    sheet = ss.insertSheet(BALANCES_SHEET_NAME);
    
    // Set up headers
    const headers = ['timestamp', 'bankBalance', 'cashBalance', 'note'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#4a5568')
      .setFontColor('#ffffff');
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
    Logger.log('✓ Balances sheet created with headers');
  }
  
  return sheet;
}

/**
 * Get the latest balance values from the sheet
 * Returns the most recent row's values, or defaults if sheet is empty
 */
function getLatestBalances_() {
  const sheet = getBalancesSheet_();
  const lastRow = sheet.getLastRow();
  
  // If only header row exists, return defaults
  if (lastRow <= 1) {
    Logger.log('No balance data found, returning defaults');
    return {
      timestamp: new Date().toISOString(),
      bankBalance: 0,
      cashBalance: 0,
      note: ''
    };
  }
  
  // Get the last row of data
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
function getBalanceHistory_(limit = 5) {
  const sheet = getBalancesSheet_();
  const lastRow = sheet.getLastRow();
  
  // If only header row exists, return empty array
  if (lastRow <= 1) {
    return [];
  }
  
  // Calculate how many rows to fetch
  const numRows = Math.min(limit, lastRow - 1);
  const startRow = lastRow - numRows + 1;
  
  // Get the data
  const values = sheet.getRange(startRow, 1, numRows, 4).getValues();
  
  // Convert to array of objects
  return values.map(function(row) {
    return {
      timestamp: row[0] ? new Date(row[0]).toISOString() : '',
      bankBalance: parseFloat(row[1]) || 0,
      cashBalance: parseFloat(row[2]) || 0,
      note: row[3] || ''
    };
  }).reverse(); // Most recent first
}

/**
 * Append a new balance entry
 * If bankBalance or cashBalance is not provided, use the previous value
 */
function appendBalance_(bankBalance, cashBalance, note) {
  const sheet = getBalancesSheet_();
  const latest = getLatestBalances_();
  
  // Use provided values or fall back to latest
  const finalBankBalance = bankBalance !== undefined && bankBalance !== null 
    ? parseFloat(bankBalance) 
    : latest.bankBalance;
    
  const finalCashBalance = cashBalance !== undefined && cashBalance !== null 
    ? parseFloat(cashBalance) 
    : latest.cashBalance;
  
  const finalNote = note || '';
  
  // Append new row
  const timestamp = new Date();
  sheet.appendRow([
    timestamp,
    finalBankBalance,
    finalCashBalance,
    finalNote
  ]);
  
  Logger.log('✓ Balance appended: Bank=' + finalBankBalance + ', Cash=' + finalCashBalance);
  
  return {
    timestamp: timestamp.toISOString(),
    bankBalance: finalBankBalance,
    cashBalance: finalCashBalance,
    note: finalNote
  };
}

/**
 * Get reconciliation data (net cash from P&L)
 * Tries to find Month_Net_Cash and Year_Net_Cash named ranges
 * Falls back to computing Revenue - Overheads if not found
 */
function getReconciliationData_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const namedRanges = ss.getNamedRanges();
  const rangeMap = {};
  
  // Build map of named ranges
  namedRanges.forEach(function(nr) {
    const range = nr.getRange();
    rangeMap[nr.getName()] = range.getValue();
  });
  
  // Try to find net cash ranges
  let monthNetCash = null;
  let yearNetCash = null;
  
  // Look for Month_Net_Cash (with variations)
  const monthNetCashPatterns = ['Month_Net_Cash', 'MonthNetCash', 'Month_Cash', 'MonthCash'];
  for (let i = 0; i < monthNetCashPatterns.length; i++) {
    if (rangeMap[monthNetCashPatterns[i]] !== undefined) {
      monthNetCash = parseFloat(rangeMap[monthNetCashPatterns[i]]) || 0;
      Logger.log('Found Month Net Cash: ' + monthNetCashPatterns[i] + ' = ' + monthNetCash);
      break;
    }
  }
  
  // Look for Year_Net_Cash (with variations)
  const yearNetCashPatterns = ['Year_Net_Cash', 'YearNetCash', 'Year_Cash', 'YearCash', 'YTD_Net_Cash'];
  for (let i = 0; i < yearNetCashPatterns.length; i++) {
    if (rangeMap[yearNetCashPatterns[i]] !== undefined) {
      yearNetCash = parseFloat(rangeMap[yearNetCashPatterns[i]]) || 0;
      Logger.log('Found Year Net Cash: ' + yearNetCashPatterns[i] + ' = ' + yearNetCash);
      break;
    }
  }
  
  // Fallback: compute from Revenue - Overheads
  if (monthNetCash === null) {
    const monthRevenue = rangeMap['Month_Total_Revenue'] || rangeMap['MonthRevenue'] || 0;
    const monthOverheads = rangeMap['Month_Total_Overheads'] || rangeMap['MonthOverheads'] || 0;
    monthNetCash = parseFloat(monthRevenue) - parseFloat(monthOverheads);
    Logger.log('→ Computed Month Net Cash from Revenue - Overheads: ' + monthNetCash);
  }
  
  if (yearNetCash === null) {
    const yearRevenue = rangeMap['Year_Total_Revenue'] || rangeMap['YearRevenue'] || 0;
    const yearOverheads = rangeMap['Year_Total_Overheads'] || rangeMap['YearOverheads'] || 0;
    yearNetCash = parseFloat(yearRevenue) - parseFloat(yearOverheads);
    Logger.log('→ Computed Year Net Cash from Revenue - Overheads: ' + yearNetCash);
  }
  
  return {
    monthNetCash: monthNetCash || 0,
    yearNetCash: yearNetCash || 0
  };
}

/**
 * Handle balance append request
 */
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

/**
 * Handle get balance request
 */
function handleGetBalance_(payload) {
  Logger.log('=== Get Balance Request ===');
  
  const latest = getLatestBalances_();
  const reconcile = getReconciliationData_();
  const history = getBalanceHistory_(5);
  
  const response = {
    latest: latest,
    reconcile: reconcile,
    history: history
  };
  
  Logger.log('Returning balance data: Bank=' + latest.bankBalance + ', Cash=' + latest.cashBalance);
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ADD THIS TO YOUR EXISTING doPost FUNCTION:
 * 
 * In your existing doPost function, add these cases to the action router:
 * 
 * // Balance endpoints
 * if (payload.action === 'appendBalance') {
 *   return handleAppendBalance_(payload);
 * }
 * 
 * if (payload.action === 'getBalance') {
 *   return handleGetBalance_(payload);
 * }
 * 
 * The secret validation should happen before these checks (as it already does).
 */

