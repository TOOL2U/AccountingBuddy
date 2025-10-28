/**
 * Google Apps Script - Accounting Buddy Webhook + Dynamic P&L + Inbox Endpoint
 * Version 6.1: Added Property/Person Expense Tracking + Inbox Data Retrieval
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open your existing Apps Script project (script.google.com)
 * 2. SELECT ALL existing code and DELETE it
 * 3. COPY this ENTIRE file and PASTE it
 * 4. Click "Deploy" → "Manage deployments"
 * 5. Click "Edit" (pencil icon) on your existing deployment
 * 6. Click "Deploy"
 * 7. The URL stays the same - no need to update environment variables!
 * 
 * NEW FEATURES IN V6.1:
 * ✨ Property/Person expense tracking in P&L data
 * ✨ Enhanced fuzzy matching for Property/Person named ranges
 * ✨ Supports: Month_Property_Person_Expense, Year_Property_Person_Expense
 * ✨ Backward compatible with all existing functionality
 * 
 * ALL FEATURES:
 * ✨ Inbox endpoint: { action: "getInbox", secret: "..." }
 * ✨ Delete endpoint: { action: "deleteEntry", secret: "...", rowNumber: 10 }
 * ✨ P&L with Property/Person tracking: { action: "getPnL", secret: "..." }
 * ✨ Real-time sync with Google Sheets
 * 
 * ALL ENDPOINTS:
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
// Named Range Discovery & Mapping
// ============================================================================

/**
 * Get all named ranges as a map with caching
 * @returns {Object} Map of named range name → { a1, value, sheet }
 */
function getNamedRangeMap_() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'named_range_map';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    Logger.log('✓ Using cached named range map');
    return JSON.parse(cached);
  }
  
  Logger.log('→ Fetching fresh named range map');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const namedRanges = ss.getNamedRanges();
  const map = {};
  
  namedRanges.forEach(function(nr) {
    const range = nr.getRange();
    const name = nr.getName();
    
    map[name] = {
      a1: range.getA1Notation(),
      value: range.getValue(),
      sheet: range.getSheet().getName()
    };
  });
  
  // Cache for 60 seconds
  cache.put(cacheKey, JSON.stringify(map), CACHE_TTL_SECONDS);
  Logger.log('✓ Cached ' + Object.keys(map).length + ' named ranges');
  
  return map;
}

/**
 * Normalize a named range name for fuzzy matching
 * Converts to lowercase and removes underscores/spaces/dashes
 */
function normalizeRangeName_(name) {
  return name.toLowerCase().replace(/[_\s-]/g, '');
}

/**
 * Calculate simple Levenshtein distance for fuzzy matching
 */
function levenshteinDistance_(a, b) {
  const matrix = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Find a named range by fuzzy matching with multiple strategies
 * @param {Object} rangeMap - Map from getNamedRangeMap_()
 * @param {Array<string>} patterns - Array of possible patterns to match
 * @param {string} metricName - Human-readable name for logging
 * @returns {Object} { value: number|null, matchedName: string|null, matchType: string }
 */
function findNamedRangeValue_(rangeMap, patterns, metricName) {
  // Strategy 1: Exact match
  for (let i = 0; i < patterns.length; i++) {
    if (rangeMap[patterns[i]]) {
      const value = rangeMap[patterns[i]].value;
      const numValue = (value === '' || value === null || value === undefined) ? 0 : Number(value) || 0;
      Logger.log('✓ ' + metricName + ': Exact match "' + patterns[i] + '" = ' + numValue);
      return { value: numValue, matchedName: patterns[i], matchType: 'exact' };
    }
  }
  
  // Strategy 2: Normalized fuzzy match (contains)
  const normalizedPatterns = patterns.map(normalizeRangeName_);
  
  for (const rangeName in rangeMap) {
    const normalizedName = normalizeRangeName_(rangeName);
    
    for (let i = 0; i < normalizedPatterns.length; i++) {
      if (normalizedName === normalizedPatterns[i]) {
        const value = rangeMap[rangeName].value;
        const numValue = (value === '' || value === null || value === undefined) ? 0 : Number(value) || 0;
        Logger.log('✓ ' + metricName + ': Normalized match "' + rangeName + '" = ' + numValue);
        return { value: numValue, matchedName: rangeName, matchType: 'normalized' };
      }
    }
  }
  
  // Strategy 3: Partial match (contains)
  for (const rangeName in rangeMap) {
    const normalizedName = normalizeRangeName_(rangeName);
    
    for (let i = 0; i < normalizedPatterns.length; i++) {
      if (normalizedName.indexOf(normalizedPatterns[i]) !== -1 || 
          normalizedPatterns[i].indexOf(normalizedName) !== -1) {
        const value = rangeMap[rangeName].value;
        const numValue = (value === '' || value === null || value === undefined) ? 0 : Number(value) || 0;
        Logger.log('✓ ' + metricName + ': Partial match "' + rangeName + '" = ' + numValue);
        return { value: numValue, matchedName: rangeName, matchType: 'partial' };
      }
    }
  }
  
  // Strategy 4: Levenshtein distance (closest match)
  let closestMatch = null;
  let closestDistance = Infinity;
  
  for (const rangeName in rangeMap) {
    const normalizedName = normalizeRangeName_(rangeName);
    
    for (let i = 0; i < normalizedPatterns.length; i++) {
      const distance = levenshteinDistance_(normalizedName, normalizedPatterns[i]);
      
      // Only consider if distance is reasonable (< 5 edits)
      if (distance < closestDistance && distance < 5) {
        closestDistance = distance;
        closestMatch = rangeName;
      }
    }
  }
  
  if (closestMatch) {
    const value = rangeMap[closestMatch].value;
    const numValue = (value === '' || value === null || value === undefined) ? 0 : Number(value) || 0;
    Logger.log('✓ ' + metricName + ': Levenshtein match "' + closestMatch + '" (distance: ' + closestDistance + ') = ' + numValue);
    return { value: numValue, matchedName: closestMatch, matchType: 'levenshtein' };
  }
  
  // Not found
  Logger.log('⚠ ' + metricName + ': No match found');
  return { value: null, matchedName: null, matchType: 'none' };
}

/**
 * Get P&L data by discovering and mapping named ranges
 * @returns {Object} P&L data structure with warnings and fallbacks
 */
function getPnLDataFromRanges_() {
  const rangeMap = getNamedRangeMap_();
  
  Logger.log('=== Named Range Discovery ===');
  Logger.log('Found ' + Object.keys(rangeMap).length + ' named ranges');
  
  // Define flexible patterns for each metric
  const patterns = {
    monthRevenue: ['Month_Total_Revenue', 'MonthRevenue', 'Month_Revenue', 'Monthly_Revenue', 'month_total_revenue', 'monthrevenue'],
    yearRevenue: ['Year_Total_Revenue', 'YearRevenue', 'Year_Revenue', 'Yearly_Revenue', 'year_total_revenue', 'yearrevenue', 'YTD_Revenue'],
    monthOverheads: ['Month_Total_Overheads', 'MonthOverheads', 'Month_Overheads', 'Monthly_Overheads', 'month_total_overheads', 'monthoverheads', 'Month_Expenses', 'MonthExpenses', 'Monthly_Expenses'],
    yearOverheads: ['Year_Total_Overheads', 'YearOverheads', 'Year_Overheads', 'Yearly_Overheads', 'year_total_overheads', 'yearoverheads', 'Year_Expenses', 'YearExpenses', 'Yearly_Expenses', 'YTD_Expenses'],
    monthPropertyPerson: ['Month_Property_Person_Expense', 'MonthPropertyPerson', 'Month_Property_Person', 'Monthly_Property_Person', 'month_property_person_expense', 'monthpropertyperson', 'Month_Property_Expense', 'MonthPropertyExpense'],
    yearPropertyPerson: ['Year_Property_Person_Expense', 'YearPropertyPerson', 'Year_Property_Person', 'Yearly_Property_Person', 'year_property_person_expense', 'yearpropertyperson', 'Year_Property_Expense', 'YearPropertyExpense', 'YTD_Property_Person'],
    monthGOP: ['Month_GOP', 'MonthGOP', 'Month_Profit', 'Monthly_Profit', 'month_gop', 'monthgop', 'Month_Gross_Operating_Profit', 'MonthGrossOperatingProfit'],
    yearGOP: ['Year_GOP', 'YearGOP', 'Year_Profit', 'Yearly_Profit', 'year_gop', 'yeargop', 'Year_Gross_Operating_Profit', 'YearGrossOperatingProfit', 'YTD_Profit'],
    monthEBITDA: ['Month_EBITDA_Margin', 'MonthEBITDA', 'Month_EBITDA', 'Monthly_EBITDA', 'month_ebitda_margin', 'monthebitda', 'MonthEBITDAMargin'],
    yearEBITDA: ['Year_EBITDA_Margin', 'YearEBITDA', 'Year_EBITDA', 'Yearly_EBITDA', 'year_ebitda_margin', 'yearebitda', 'YearEBITDAMargin', 'YTD_EBITDA']
  };
  
  // Discover values with detailed matching info
  const monthRevenueMatch = findNamedRangeValue_(rangeMap, patterns.monthRevenue, 'Month Revenue');
  const yearRevenueMatch = findNamedRangeValue_(rangeMap, patterns.yearRevenue, 'Year Revenue');
  const monthOverheadsMatch = findNamedRangeValue_(rangeMap, patterns.monthOverheads, 'Month Overheads');
  const yearOverheadsMatch = findNamedRangeValue_(rangeMap, patterns.yearOverheads, 'Year Overheads');
  const monthPropertyPersonMatch = findNamedRangeValue_(rangeMap, patterns.monthPropertyPerson, 'Month Property/Person');
  const yearPropertyPersonMatch = findNamedRangeValue_(rangeMap, patterns.yearPropertyPerson, 'Year Property/Person');
  const monthGOPMatch = findNamedRangeValue_(rangeMap, patterns.monthGOP, 'Month GOP');
  const yearGOPMatch = findNamedRangeValue_(rangeMap, patterns.yearGOP, 'Year GOP');
  const monthEBITDAMatch = findNamedRangeValue_(rangeMap, patterns.monthEBITDA, 'Month EBITDA');
  const yearEBITDAMatch = findNamedRangeValue_(rangeMap, patterns.yearEBITDA, 'Year EBITDA');
  
  const warnings = [];
  const computedFallbacks = [];
  const matchInfo = {};
  
  // Extract values
  const monthRevenue = monthRevenueMatch.value;
  const yearRevenue = yearRevenueMatch.value;
  const monthOverheads = monthOverheadsMatch.value;
  const yearOverheads = yearOverheadsMatch.value;
  const monthPropertyPerson = monthPropertyPersonMatch.value;
  const yearPropertyPerson = yearPropertyPersonMatch.value;
  const monthGOP = monthGOPMatch.value;
  const yearGOP = yearGOPMatch.value;
  let monthEBITDA = monthEBITDAMatch.value;
  let yearEBITDA = yearEBITDAMatch.value;
  
  // Track match info
  matchInfo.monthRevenue = { name: monthRevenueMatch.matchedName, type: monthRevenueMatch.matchType };
  matchInfo.yearRevenue = { name: yearRevenueMatch.matchedName, type: yearRevenueMatch.matchType };
  matchInfo.monthOverheads = { name: monthOverheadsMatch.matchedName, type: monthOverheadsMatch.matchType };
  matchInfo.yearOverheads = { name: yearOverheadsMatch.matchedName, type: yearOverheadsMatch.matchType };
  matchInfo.monthPropertyPerson = { name: monthPropertyPersonMatch.matchedName, type: monthPropertyPersonMatch.matchType };
  matchInfo.yearPropertyPerson = { name: yearPropertyPersonMatch.matchedName, type: yearPropertyPersonMatch.matchType };
  matchInfo.monthGOP = { name: monthGOPMatch.matchedName, type: monthGOPMatch.matchType };
  matchInfo.yearGOP = { name: yearGOPMatch.matchedName, type: yearGOPMatch.matchType };
  
  // Check for missing required ranges
  if (monthRevenue === null) warnings.push('Missing: Month Revenue (tried: ' + patterns.monthRevenue.join(', ') + ')');
  if (yearRevenue === null) warnings.push('Missing: Year Revenue (tried: ' + patterns.yearRevenue.join(', ') + ')');
  if (monthOverheads === null) warnings.push('Missing: Month Overheads (tried: ' + patterns.monthOverheads.join(', ') + ')');
  if (yearOverheads === null) warnings.push('Missing: Year Overheads (tried: ' + patterns.yearOverheads.join(', ') + ')');
  if (monthPropertyPerson === null) warnings.push('Missing: Month Property/Person (tried: ' + patterns.monthPropertyPerson.join(', ') + ')');
  if (yearPropertyPerson === null) warnings.push('Missing: Year Property/Person (tried: ' + patterns.yearPropertyPerson.join(', ') + ')');
  if (monthGOP === null) warnings.push('Missing: Month GOP (tried: ' + patterns.monthGOP.join(', ') + ')');
  if (yearGOP === null) warnings.push('Missing: Year GOP (tried: ' + patterns.yearGOP.join(', ') + ')');

  // Compute EBITDA margins if not found or zero
  if (monthEBITDA === null || monthEBITDA === 0) {
    if (monthRevenue && monthRevenue !== 0 && monthGOP !== null) {
      monthEBITDA = (monthGOP / monthRevenue) * 100;
      computedFallbacks.push('Month EBITDA Margin (computed: ' + monthEBITDA.toFixed(2) + '%)');
      Logger.log('→ Computed Month EBITDA: ' + monthEBITDA.toFixed(2) + '%');
    } else {
      monthEBITDA = 0;
      warnings.push('Cannot compute Month EBITDA (revenue or GOP missing)');
    }
  }

  if (yearEBITDA === null || yearEBITDA === 0) {
    if (yearRevenue && yearRevenue !== 0 && yearGOP !== null) {
      yearEBITDA = (yearGOP / yearRevenue) * 100;
      computedFallbacks.push('Year EBITDA Margin (computed: ' + yearEBITDA.toFixed(2) + '%)');
      Logger.log('→ Computed Year EBITDA: ' + yearEBITDA.toFixed(2) + '%');
    } else {
      yearEBITDA = 0;
      warnings.push('Cannot compute Year EBITDA (revenue or GOP missing)');
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    Logger.log('⚠ WARNINGS:');
    warnings.forEach(function(w) { Logger.log('  - ' + w); });
  }

  if (computedFallbacks.length > 0) {
    Logger.log('→ COMPUTED FALLBACKS:');
    computedFallbacks.forEach(function(f) { Logger.log('  - ' + f); });
  }

  return {
    month: {
      revenue: monthRevenue || 0,
      overheads: monthOverheads || 0,
      propertyPersonExpense: monthPropertyPerson || 0,
      gop: monthGOP || 0,
      ebitdaMargin: monthEBITDA || 0
    },
    year: {
      revenue: yearRevenue || 0,
      overheads: yearOverheads || 0,
      propertyPersonExpense: yearPropertyPerson || 0,
      gop: yearGOP || 0,
      ebitdaMargin: yearEBITDA || 0
    },
    warnings: warnings,
    computedFallbacks: computedFallbacks,
    matchInfo: matchInfo
  };
}

/**
 * Format date from day, month, year
 */
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
// doGet - Health check endpoint
// ============================================================================
function doGet(e) {
      return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Accounting Buddy webhook + Dynamic P&L + Inbox endpoint is running',
      version: '6.1 - With Property/Person Expense Tracking + Inbox Data Retrieval',
      timestamp: new Date().toISOString(),
      endpoints: {
        webhook: 'POST with accounting data',
        pnl: 'POST with { action: "getPnL", secret: "..." }',
        inbox: 'POST with { action: "getInbox", secret: "..." }',
        delete: 'POST with { action: "deleteEntry", secret: "...", rowNumber: 10 }',
        propertyPerson: 'POST with { action: "getPropertyPersonDetails", secret: "...", period: "month|year" }',
        discover: 'POST with { action: "list_named_ranges", secret: "..." }'
      },
      features: [
        'Automatic named range discovery',
        'Fuzzy matching (handles naming variations)',
        '60-second caching with CacheService',
        'Computed EBITDA fallbacks',
        'Property/Person expense tracking',
        'Inbox data retrieval',
        'Delete entry functionality',
        'Graceful error handling'
      ]
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// doPost - Main router
// ============================================================================
function doPost(e) {
  try {
    Logger.log('=== Incoming POST Request ===');
    Logger.log('Has postData: ' + !!(e.postData && e.postData.contents));

    if (!e.postData || !e.postData.contents) {
      Logger.log('ERROR: No POST data received');
      return createErrorResponse('No POST data received');
    }

    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
      Logger.log('Payload parsed successfully');
      Logger.log('Payload keys: ' + Object.keys(payload).join(', '));
    } catch (parseError) {
      Logger.log('ERROR: Failed to parse JSON: ' + parseError.toString());
      return createErrorResponse('Invalid JSON in POST body');
    }

    const incomingSecret = payload.secret;
    Logger.log('Has secret in payload: ' + !!incomingSecret);
    Logger.log('Secret matches: ' + (incomingSecret === EXPECTED_SECRET));

    if (incomingSecret !== EXPECTED_SECRET) {
      Logger.log('ERROR: Authentication failed');
      return createErrorResponse('Unauthorized');
    }

    Logger.log('✓ Authentication successful');

    // Route based on action
    if (payload.action === 'getPnL') {
      Logger.log('→ Routing to P&L endpoint');
      return handleGetPnL();
    } else if (payload.action === 'getInbox') {
      Logger.log('→ Routing to Inbox endpoint');
      return handleGetInbox();
    } else if (payload.action === 'deleteEntry') {
      Logger.log('→ Routing to Delete endpoint');
      return handleDeleteEntry(payload.rowNumber);
    } else if (payload.action === 'getPropertyPersonDetails') {
      Logger.log('→ Routing to Property/Person Details endpoint');
      Logger.log('Full payload: ' + JSON.stringify(payload));
      Logger.log('Period from payload: ' + payload.period);
      return handleGetPropertyPersonDetails(payload.period);
    } else if (payload.action === 'list_named_ranges') {
      Logger.log('→ Routing to discovery endpoint');
      return handleDiscoverRanges();
    } else if (payload.day && payload.month && payload.year) {
      Logger.log('→ Routing to webhook endpoint');
      return handleWebhook(payload);
    } else {
      Logger.log('ERROR: Unknown request type');
      return createErrorResponse('Unknown request type. Expected: getPnL, getInbox, deleteEntry, list_named_ranges, or webhook data');
    }

  } catch (error) {
    Logger.log('ERROR in doPost: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return createErrorResponse('Internal server error: ' + error.toString());
  }
}

// ============================================================================
// handleWebhook - Process accounting data
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

// ============================================================================
// handleGetPnL - Get P&L data with automatic discovery and caching
// ============================================================================
function handleGetPnL() {
  try {
    Logger.log('=== P&L Data Request ===');

    // Try to get from cache first (60s TTL)
    const cache = CacheService.getScriptCache();
    const cacheKey = 'pnl_data';
    const cached = cache.get(cacheKey);

    if (cached) {
      Logger.log('✓ Returning cached P&L data');
      const cachedData = JSON.parse(cached);
      cachedData.cached = true;
      return ContentService
        .createTextOutput(JSON.stringify(cachedData))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Get fresh data
    Logger.log('→ Fetching fresh P&L data');
    const pnlData = getPnLDataFromRanges_();

    const response = {
      ok: true,
      data: {
        month: pnlData.month,
        year: pnlData.year,
        updatedAt: new Date().toISOString()
      },
      computedFallbacks: pnlData.computedFallbacks || [],
      warnings: pnlData.warnings || [],
      matchInfo: pnlData.matchInfo || {},
      cached: false
    };

    const responseJson = JSON.stringify(response);

    // Cache for 60 seconds
    cache.put(cacheKey, responseJson, CACHE_TTL_SECONDS);
    Logger.log('✓ P&L data cached for ' + CACHE_TTL_SECONDS + 's');

    return ContentService
      .createTextOutput(responseJson)
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('ERROR in handleGetPnL: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return createErrorResponse('P&L error: ' + error.toString());
  }
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
// handleDiscoverRanges - List all named ranges (admin/debug endpoint)
// ============================================================================
function handleDiscoverRanges() {
  try {
    Logger.log('=== Named Range Discovery Request ===');

    const rangeMap = getNamedRangeMap_();

    // Convert to array for easier display
    const ranges = [];
    for (const name in rangeMap) {
      ranges.push({
        name: name,
        sheet: rangeMap[name].sheet,
        a1: rangeMap[name].a1,
        value: rangeMap[name].value,
        type: typeof rangeMap[name].value
      });
    }

    // Sort by name
    ranges.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });

    // Categorize ranges
    const pnlRelated = ranges.filter(function(r) {
      const name = r.name.toLowerCase();
      return name.indexOf('revenue') !== -1 ||
             name.indexOf('overhead') !== -1 ||
             name.indexOf('expense') !== -1 ||
             name.indexOf('gop') !== -1 ||
             name.indexOf('profit') !== -1 ||
             name.indexOf('ebitda') !== -1 ||
             name.indexOf('month') !== -1 ||
             name.indexOf('year') !== -1;
    });

    const response = {
      ok: true,
      totalRanges: ranges.length,
      pnlRelatedCount: pnlRelated.length,
      ranges: ranges,
      pnlRelated: pnlRelated,
      timestamp: new Date().toISOString(),
      suggestions: [
        'Create named ranges with patterns like: Month_Total_Revenue, Year_Total_Revenue',
        'System will auto-detect variations: MonthRevenue, month_revenue, Monthly_Revenue, etc.',
        'Supported metrics: Revenue, Overheads/Expenses, GOP/Profit, EBITDA'
      ]
    };

    Logger.log('✓ Discovered ' + ranges.length + ' named ranges (' + pnlRelated.length + ' P&L-related)');

    return ContentService
      .createTextOutput(JSON.stringify(response, null, 2))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('ERROR in handleDiscoverRanges: ' + error.toString());
    return createErrorResponse('Discovery error: ' + error.toString());
  }
}

// ============================================================================
// handleGetPropertyPersonDetails - Get individual property/person expenses
// ============================================================================
function handleGetPropertyPersonDetails(period) {
  try {
    Logger.log('=== Property/Person Details Request ===');
    Logger.log('Period: ' + period);

    if (!period || !['month', 'year'].includes(period)) {
      return createErrorResponse('Invalid period. Must be "month" or "year".');
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("P&L ");
    
    if (!sheet) {
      return createErrorResponse('P&L sheet not found');
    }

    // Property/Person names are in rows 14-19, column A
    // Property/Person values are in rows 14-19, column N (month) or Q (year)
    const nameRange = sheet.getRange("A14:A19");
    const nameValues = nameRange.getValues();
    
    // Determine which column to use based on period
    let valueColumn;
    if (period === 'month') {
      // Find current month column dynamically
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEPT", "OCT", "NOV", "DEC"];
      const currentMonth = months[new Date().getMonth()];
      const headerRow = sheet.getRange("A4:Z4").getValues()[0];
      
      let monthColumnIndex = null;
      for (let i = 0; i < headerRow.length; i++) {
        if (headerRow[i] && headerRow[i].toString().toUpperCase().trim() === currentMonth) {
          monthColumnIndex = i + 1; // Convert to 1-based index
          break;
        }
      }
      
      if (!monthColumnIndex) {
        return createErrorResponse('Could not find current month column');
      }
      
      valueColumn = String.fromCharCode(64 + monthColumnIndex); // Convert to letter
      Logger.log('Using month column: ' + valueColumn + ' for ' + currentMonth);
    } else {
      valueColumn = 'Q'; // Year total column
      Logger.log('Using year column: Q');
    }
    
    const valueRange = sheet.getRange(valueColumn + "14:" + valueColumn + "19");
    const valueValues = valueRange.getValues();
    
    // Build the data array
    const data = [];
    let totalExpense = 0;
    
    for (let i = 0; i < nameValues.length; i++) {
      const name = nameValues[i][0];
      const expense = parseFloat(valueValues[i][0]) || 0;
      
      if (name && name.toString().trim() !== '') {
        data.push({
          name: name.toString().trim(),
          expense: expense
        });
        totalExpense += expense;
      }
    }
    
    // Calculate percentages
    data.forEach(function(item) {
      item.percentage = totalExpense > 0 ? (item.expense / totalExpense) * 100 : 0;
    });
    
    // Sort by expense amount (descending)
    data.sort(function(a, b) {
      return b.expense - a.expense;
    });
    
    Logger.log('✓ Found ' + data.length + ' property/person items, total: ' + totalExpense);

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        data: data,
        period: period,
        totalExpense: totalExpense,
        column: valueColumn,
        count: data.length,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('ERROR in handleGetPropertyPersonDetails: ' + error.toString());
    return createErrorResponse('Property/Person details error: ' + error.toString());
  }
}

// ============================================================================
// Helper function to create error responses
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
// Test functions
// ============================================================================

/**
 * Test webhook functionality
 */
function testWebhook() {
  const testPayload = {
    secret: EXPECTED_SECRET,
    day: "27",
    month: "Oct",
    year: "2025",
    property: "Sia Moon",
    typeOfOperation: "EXP - Construction - Materials",
    typeOfPayment: "Cash",
    detail: "Test receipt from Apps Script V6",
    ref: "TEST-V6",
    debit: 1000,
    credit: 0
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testPayload)
    }
  };

  const response = doPost(mockEvent);
  Logger.log('=== Webhook Test Response ===');
  Logger.log(response.getContent());
}

/**
 * Test P&L endpoint functionality
 */
function testPnLEndpoint() {
  const testPayload = {
    action: 'getPnL',
    secret: EXPECTED_SECRET
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testPayload)
    }
  };

  const response = doPost(mockEvent);
  Logger.log('=== P&L Test Response ===');
  Logger.log(response.getContent());
}

/**
 * Test inbox endpoint functionality
 */
function testInboxEndpoint() {
  const testPayload = {
    action: 'getInbox',
    secret: EXPECTED_SECRET
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testPayload)
    }
  };

  const response = doPost(mockEvent);
  Logger.log('=== Inbox Test Response ===');
  Logger.log(response.getContent());
}

/**
 * Test delete endpoint functionality
 */
function testDeleteEndpoint() {
  const testPayload = {
    action: 'deleteEntry',
    secret: EXPECTED_SECRET,
    rowNumber: 10 // Change this to an actual row number
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testPayload)
    }
  };

  const response = doPost(mockEvent);
  Logger.log('=== Delete Test Response ===');
  Logger.log(response.getContent());
}

/**
 * Test property/person details endpoint functionality
 */
function testPropertyPersonEndpoint() {
  const testPayload = {
    action: 'getPropertyPersonDetails',
    period: 'month',
    secret: EXPECTED_SECRET
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testPayload)
    }
  };

  const response = doPost(mockEvent);
  Logger.log('=== Property/Person Test Response ===');
  Logger.log(response.getContent());
}

/**
 * Test named range discovery
 */
function testDiscovery() {
  const testPayload = {
    action: 'list_named_ranges',
    secret: EXPECTED_SECRET
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testPayload)
    }
  };

  const response = doPost(mockEvent);
  Logger.log('=== Discovery Test Response ===');
  Logger.log(response.getContent());
}

/**
 * Clear all caches (useful for testing)
 */
function clearAllCaches() {
  const cache = CacheService.getScriptCache();
  cache.removeAll(['pnl_data', 'named_range_map']);
  Logger.log('✓ All caches cleared');
}

// ============================================================================
// P&L Named Ranges Creation Functions
// ============================================================================

/**
 * Create P&L Named Ranges with Dynamic Month Detection
 * 
 * This function creates all the named ranges needed for the P&L Dashboard
 * based on the current structure of your "P&L " sheet with Property/Person section.
 * 
 * INSTRUCTIONS:
 * 1. Run this function: createPnLNamedRanges()
 * 2. Check the execution log to verify all ranges were created
 * 3. Test with: testPnLEndpoint()
 * 
 * Updated: 2025-10-28 (With Property/Person section + Dynamic Month Detection)
 * Sheet Structure:
 * - Row 11: Total Revenue (Current Month Column = This Month, Q = Year Total)
 * - Row 20: Total Property or Person Expense (Current Month Column = This Month, Q = Year Total)  
 * - Row 46: Total Overhead Expense (Current Month Column = This Month, Q = Year Total)
 * - Row 49: Gross Operating Profit (Current Month Column = This Month, Q = Year Total)
 * - Row 50: EBITDA Margin (Current Month Column = This Month, Q = Year Total)
 */
function createPnLNamedRanges() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = "P&L "; // Note: Has trailing space
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    Logger.log("❌ Sheet '" + sheetName + "' not found!");
    Logger.log("Available sheets:");
    ss.getSheets().forEach(function(s) {
      Logger.log("  - " + s.getName());
    });
    return;
  }
  
  Logger.log("✓ Found sheet: " + sheetName);
  Logger.log("");
  Logger.log("Creating named ranges for Property/Person P&L with dynamic month detection...");
  Logger.log("");
  
  // Get current month
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEPT", "OCT", "NOV", "DEC"];
  const currentMonth = months[new Date().getMonth()];
  Logger.log("📅 Current month: " + currentMonth);
  
  // Find the column for current month (row 4 has month headers)
  const headerRow = sheet.getRange("A4:Z4").getValues()[0];
  let monthColumn = null;
  let monthColumnLetter = null;
  
  for (let i = 0; i < headerRow.length; i++) {
    if (headerRow[i] && headerRow[i].toString().toUpperCase().trim() === currentMonth) {
      monthColumn = i + 1; // Convert to 1-based index
      monthColumnLetter = String.fromCharCode(64 + monthColumn);
      Logger.log("✓ Found current month in column: " + monthColumnLetter);
      break;
    }
  }
  
  if (!monthColumn) {
    Logger.log("❌ Could not find current month column!");
    Logger.log("Available headers: " + headerRow.filter(h => h).join(", "));
    return;
  }
  
  // Define all named ranges to create with dynamic month column
  const ranges = [
    // MONTH (Current Month - Dynamic Column)
    {
      name: "Month_Total_Revenue",
      cell: monthColumnLetter + "11",
      description: "This Month Total Revenue (" + currentMonth + ")"
    },
    {
      name: "Month_Property_Person_Expense", 
      cell: monthColumnLetter + "20",
      description: "This Month Total Property or Person Expense (" + currentMonth + ")"
    },
    {
      name: "Month_Total_Overheads",
      cell: monthColumnLetter + "46",
      description: "This Month Total Overhead Expense (" + currentMonth + ")"
    },
    {
      name: "Month_GOP",
      cell: monthColumnLetter + "49",
      description: "This Month Gross Operating Profit (" + currentMonth + ")"
    },
    {
      name: "Month_EBITDA_Margin",
      cell: monthColumnLetter + "50",
      description: "This Month EBITDA Margin (" + currentMonth + ")"
    },
    
    // YEAR (Year Total - Column Q)
    {
      name: "Year_Total_Revenue",
      cell: "Q11",
      description: "Year Total Revenue"
    },
    {
      name: "Year_Property_Person_Expense",
      cell: "Q20", 
      description: "Year Total Property or Person Expense"
    },
    {
      name: "Year_Total_Overheads",
      cell: "Q46",
      description: "Year Total Overhead Expense"
    },
    {
      name: "Year_GOP",
      cell: "Q49",
      description: "Year Gross Operating Profit"
    },
    {
      name: "Year_EBITDA_Margin",
      cell: "Q50",
      description: "Year EBITDA Margin"
    }
  ];
  
  // Create each named range
  var successCount = 0;
  var errorCount = 0;
  
  ranges.forEach(function(rangeConfig) {
    try {
      // Get the cell value to display
      var cellValue = sheet.getRange(rangeConfig.cell).getValue();
      
      // Create or update the named range
      ss.setNamedRange(rangeConfig.name, sheet.getRange(rangeConfig.cell));
      
      Logger.log("✓ Created: " + rangeConfig.name + " → " + rangeConfig.cell + " (value: " + cellValue + ")");
      successCount++;
      
    } catch (error) {
      Logger.log("❌ Failed: " + rangeConfig.name + " - " + error.toString());
      errorCount++;
    }
  });
  
  Logger.log("");
  Logger.log("=== SUMMARY ===");
  Logger.log("✅ Successfully created: " + successCount + " named ranges");
  if (errorCount > 0) {
    Logger.log("❌ Failed to create: " + errorCount + " named ranges");
  }
  Logger.log("");
  Logger.log("🎉 Done! Your P&L Dashboard with Property/Person tracking is ready!");
  Logger.log("Next: Test with testPnLEndpoint()");
}

/**
 * Verify P&L Named Ranges
 * 
 * This function checks that all required named ranges exist and have valid references
 */
function verifyPnLNamedRanges() {
  Logger.log("=== Verifying P&L Named Ranges ===");
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const namedRanges = ss.getNamedRanges();
  
  const requiredRanges = [
    'Month_Total_Revenue',
    'Month_Property_Person_Expense',
    'Month_Total_Overheads', 
    'Month_GOP',
    'Month_EBITDA_Margin',
    'Year_Total_Revenue',
    'Year_Property_Person_Expense',
    'Year_Total_Overheads',
    'Year_GOP',
    'Year_EBITDA_Margin'
  ];
  
  var foundCount = 0;
  var missingRanges = [];
  
  requiredRanges.forEach(function(rangeName) {
    var found = false;
    
    namedRanges.forEach(function(nr) {
      if (nr.getName() === rangeName) {
        const range = nr.getRange();
        const value = range.getValue();
        Logger.log("✓ " + rangeName + " → " + range.getA1Notation() + " (value: " + value + ")");
        found = true;
        foundCount++;
      }
    });
    
    if (!found) {
      missingRanges.push(rangeName);
    }
  });
  
  Logger.log("");
  Logger.log("=== VERIFICATION SUMMARY ===");
  Logger.log("✅ Found: " + foundCount + "/" + requiredRanges.length + " required ranges");
  
  if (missingRanges.length > 0) {
    Logger.log("❌ Missing ranges:");
    missingRanges.forEach(function(name) {
      Logger.log("  - " + name);
    });
    Logger.log("");
    Logger.log("💡 Run createPnLNamedRanges() to create missing ranges");
  } else {
    Logger.log("🎉 All required named ranges found! P&L Dashboard ready!");
  }
  
  return {
    total: requiredRanges.length,
    found: foundCount,
    missing: missingRanges
  };
}

