#!/usr/bin/env node

/**
 * Auto-Fix Named Ranges Script
 * 
 * This script:
 * 1. Scans the P&L sheet to find actual row positions of key metrics
 * 2. Automatically updates named ranges to point to the correct cells
 * 3. No manual intervention required!
 * 
 * Usage: node auto-fix-named-ranges.js [--dry-run]
 */

require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');
const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function success(msg) { console.log(`${colors.green}✅ ${msg}${colors.reset}`); }
function warning(msg) { console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`); }
function info(msg) { console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`); }
function error(msg) { console.log(`${colors.red}❌ ${msg}${colors.reset}`); }

async function autoFixNamedRanges() {
  const credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('\n' + '='.repeat(70));
  console.log('  🔧 AUTO-FIX NAMED RANGES');
  console.log('='.repeat(70) + '\n');
  
  if (DRY_RUN) {
    warning('DRY RUN MODE - No changes will be made\n');
  }
  
  // Step 1: Get sheet metadata
  info('Step 1: Fetching sheet metadata...');
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    includeGridData: false
  });
  
  const pnlSheet = spreadsheet.data.sheets.find(s => 
    s.properties.title === 'P&L (DO NOT EDIT)'
  );
  
  if (!pnlSheet) {
    error('P&L (DO NOT EDIT) sheet not found!');
    process.exit(1);
  }
  
  const sheetId = pnlSheet.properties.sheetId;
  success(`Found P&L sheet (ID: ${sheetId})\n`);
  
  // Step 2: Scan P&L structure
  info('Step 2: Scanning P&L sheet structure...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "'P&L (DO NOT EDIT)'!A1:A100",
  });
  
  const values = response.data.values || [];
  
  // Find key metric rows
  let totalRevenueRow = null;
  let totalOverheadRow = null;
  let gopRow = null;
  let ebitdaMarginRow = null;
  let propertyPersonRow = null;
  
  values.forEach((row, index) => {
    const cellValue = (row[0] || '').trim();
    const upperValue = cellValue.toUpperCase();
    
    // Total Revenue
    if (upperValue === 'TOTAL REVENUE') {
      totalRevenueRow = index + 1;
    }
    
    // Total Overhead Expense
    if (upperValue.includes('TOTAL OVERHEAD') && upperValue.includes('EXPENSE')) {
      totalOverheadRow = index + 1;
    }
    
    // GOP / EBITDA
    if (upperValue.includes('GROSS OPERATING PROFIT') || 
        (upperValue.includes('GOP') && upperValue.includes('EBITDA'))) {
      gopRow = index + 1;
    }
    
    // EBITDA Margin
    if (upperValue === 'EBITDA MARGIN' || 
        (upperValue.includes('EBITDA') && upperValue.includes('MARGIN'))) {
      ebitdaMarginRow = index + 1;
    }
    
    // Property or Person Total
    if (upperValue.includes('TOTAL PROPERTY') && upperValue.includes('PERSON')) {
      propertyPersonRow = index + 1;
    }
  });
  
  console.log(`\n   Found key metrics:`);
  console.log(`   - Total Revenue: Row ${totalRevenueRow}`);
  console.log(`   - Total Overhead: Row ${totalOverheadRow}`);
  console.log(`   - GOP (EBITDA): Row ${gopRow}`);
  console.log(`   - EBITDA Margin: Row ${ebitdaMarginRow}`);
  console.log(`   - Property/Person Total: Row ${propertyPersonRow}\n`);
  
  if (!totalRevenueRow || !gopRow || !ebitdaMarginRow) {
    error('Could not find all required metrics!');
    process.exit(1);
  }
  
  success('All key metrics found\n');
  
  // Step 3: Get current named ranges
  info('Step 3: Fetching current named ranges...');
  const namedRanges = spreadsheet.data.namedRanges || [];
  
  const namedRangeMap = {};
  namedRanges.forEach(nr => {
    namedRangeMap[nr.name] = {
      namedRangeId: nr.namedRangeId,
      currentRow: nr.range.startRowIndex + 1,
      currentCol: nr.range.startColumnIndex
    };
  });
  
  success(`Found ${Object.keys(namedRangeMap).length} named ranges\n`);
  
  // Step 4: Determine required updates
  info('Step 4: Determining required updates...');
  
  const updates = [];
  
  // Month column = O (index 14), Year column = Q (index 16)
  const monthCol = 14; // Column O
  const yearCol = 16;  // Column Q
  
  const requiredRanges = [
    // Revenue
    { name: 'Month_Total_Revenue', row: totalRevenueRow, col: monthCol },
    { name: 'Year_Total_Revenue', row: totalRevenueRow, col: yearCol },
    
    // Overheads (only if found)
    ...(totalOverheadRow ? [
      { name: 'Month_Total_Overheads', row: totalOverheadRow, col: monthCol },
      { name: 'Year_Total_Overheads', row: totalOverheadRow, col: yearCol },
    ] : []),
    
    // GOP
    { name: 'Month_GOP', row: gopRow, col: monthCol },
    { name: 'Year_GOP', row: gopRow, col: yearCol },
    
    // EBITDA Margin
    { name: 'Month_EBITDA_Margin', row: ebitdaMarginRow, col: monthCol },
    { name: 'Year_EBITDA_Margin', row: ebitdaMarginRow, col: yearCol },
    
    // Property/Person (only if found)
    ...(propertyPersonRow ? [
      { name: 'Month_Property_Person_Expense', row: propertyPersonRow, col: monthCol },
      { name: 'Year_Property_Person_Expense', row: propertyPersonRow, col: yearCol },
    ] : []),
  ];
  
  console.log('\n   Checking each named range:\n');
  
  for (const required of requiredRanges) {
    const current = namedRangeMap[required.name];
    
    if (!current) {
      warning(`   ${required.name} - NOT FOUND (will create)`);
      updates.push({
        action: 'create',
        name: required.name,
        row: required.row,
        col: required.col
      });
    } else if (current.currentRow !== required.row || current.currentCol !== required.col) {
      const currentCell = String.fromCharCode(65 + current.currentCol) + current.currentRow;
      const newCell = String.fromCharCode(65 + required.col) + required.row;
      console.log(`   ${required.name.padEnd(35)} ${currentCell} → ${newCell} ${colors.yellow}(UPDATE)${colors.reset}`);
      updates.push({
        action: 'update',
        name: required.name,
        namedRangeId: current.namedRangeId,
        oldRow: current.currentRow,
        oldCol: current.currentCol,
        row: required.row,
        col: required.col
      });
    } else {
      const cell = String.fromCharCode(65 + required.col) + required.row;
      console.log(`   ${required.name.padEnd(35)} ${cell} ${colors.green}(OK)${colors.reset}`);
    }
  }
  
  console.log('');
  
  if (updates.length === 0) {
    success('All named ranges are already correct! No updates needed.\n');
    return;
  }
  
  info(`Found ${updates.length} named range(s) that need updating\n`);
  
  // Step 5: Apply updates
  if (DRY_RUN) {
    warning('DRY RUN MODE - Skipping actual updates');
    console.log('\nWould apply these updates:');
    updates.forEach(u => {
      if (u.action === 'update') {
        const oldCell = String.fromCharCode(65 + u.oldCol) + u.oldRow;
        const newCell = String.fromCharCode(65 + u.col) + u.row;
        console.log(`  - Update ${u.name}: ${oldCell} → ${newCell}`);
      } else {
        const newCell = String.fromCharCode(65 + u.col) + u.row;
        console.log(`  - Create ${u.name}: ${newCell}`);
      }
    });
  } else {
    info('Step 5: Applying updates to Google Sheets...\n');
    
    const requests = [];
    
    for (const update of updates) {
      if (update.action === 'update') {
        // Update existing named range
        requests.push({
          updateNamedRange: {
            namedRange: {
              namedRangeId: update.namedRangeId,
              name: update.name,
              range: {
                sheetId: sheetId,
                startRowIndex: update.row - 1,
                endRowIndex: update.row,
                startColumnIndex: update.col,
                endColumnIndex: update.col + 1
              }
            },
            fields: 'range'
          }
        });
      } else if (update.action === 'create') {
        // Create new named range
        requests.push({
          addNamedRange: {
            namedRange: {
              name: update.name,
              range: {
                sheetId: sheetId,
                startRowIndex: update.row - 1,
                endRowIndex: update.row,
                startColumnIndex: update.col,
                endColumnIndex: update.col + 1
              }
            }
          }
        });
      }
    }
    
    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        requestBody: {
          requests: requests
        }
      });
      
      success(`Successfully updated ${updates.length} named range(s)!\n`);
    }
  }
  
  // Step 6: Verify updates
  if (!DRY_RUN && updates.length > 0) {
    info('Step 6: Verifying updates...');
    
    const verifyResponse = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      includeGridData: false
    });
    
    const updatedRanges = verifyResponse.data.namedRanges || [];
    
    console.log('\n   Updated named ranges:\n');
    
    requiredRanges.forEach(required => {
      const range = updatedRanges.find(r => r.name === required.name);
      if (range) {
        const row = range.range.startRowIndex + 1;
        const col = String.fromCharCode(65 + range.range.startColumnIndex);
        const cell = col + row;
        const status = (row === required.row) ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset;
        console.log(`   ${status} ${required.name.padEnd(35)} → ${cell}`);
      }
    });
    
    console.log('');
    success('Verification complete!\n');
  }
  
  console.log('='.repeat(70));
  console.log('  ✅ DONE');
  console.log('='.repeat(70) + '\n');
}

autoFixNamedRanges().catch(err => {
  error(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
