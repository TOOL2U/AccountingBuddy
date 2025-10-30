/**
 * Fix ALL P&L Named Ranges to Point to Correct Rows
 * 
 * Based on actual sheet structure inspection:
 * - Row 11: Total Revenue ✅
 * - Row 20: Total Property or Person Expense ✅
 * - Row 52: Total Overhead Expense ✅ (FIXED)
 * - Row 55: Gross Operating Profit (GOP) ❌ (currently points to row 49)
 * - Row 56: EBITDA Margin ❌ (currently points to row 50)
 */

const { google } = require('googleapis');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'accounting-buddy-476114-82555a53603b.json');

if (!SPREADSHEET_ID) {
  console.error('❌ Missing GOOGLE_SHEET_ID in .env.local');
  process.exit(1);
}

const SHEET_NAME = 'P&L (DO NOT EDIT)';

// CORRECT row numbers based on actual sheet structure
const CORRECT_ROWS = {
  TOTAL_REVENUE: 11,
  PROPERTY_PERSON_EXPENSE: 20,
  TOTAL_OVERHEADS: 52,
  GOP: 55,  // NOT 49!
  EBITDA_MARGIN: 56,  // NOT 50!
};

async function fixAllNamedRanges() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔧 FIX ALL P&L NAMED RANGES');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Authenticate
    console.log('🔐 Authenticating with service account...');
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    console.log('✓ Authenticated successfully\n');

    // Get spreadsheet info
    console.log('📊 Fetching spreadsheet info...');
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'sheets,namedRanges',
    });

    const pnlSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === SHEET_NAME
    );

    if (!pnlSheet) {
      console.error(`❌ Sheet "${SHEET_NAME}" not found!`);
      process.exit(1);
    }

    const sheetId = pnlSheet.properties?.sheetId;
    console.log(`✓ Found sheet: "${SHEET_NAME}" (ID: ${sheetId})\n`);

    // Find current month column
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📅 Finding Current Month Column...\n');

    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A4:Z4`,
    });

    const headers = headerResponse.data.values?.[0] || [];
    const currentMonth = new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const monthColumnIndex = headers.findIndex(h => 
      h && h.toString().toUpperCase().includes(currentMonth)
    );

    if (monthColumnIndex === -1) {
      console.error(`❌ Could not find ${currentMonth} column in headers`);
      process.exit(1);
    }

    const monthColumn = String.fromCharCode(65 + monthColumnIndex);
    console.log(`✓ Current month: ${currentMonth}`);
    console.log(`✓ Month column: ${monthColumn} (index ${monthColumnIndex})\n`);

    // Get existing named ranges
    const namedRanges = spreadsheet.data.namedRanges || [];
    
    // Define correct named ranges
    const correctRanges = [
      // MONTH ranges
      { name: 'Month_Total_Revenue', row: CORRECT_ROWS.TOTAL_REVENUE, col: monthColumn },
      { name: 'Month_Property_Person_Expense', row: CORRECT_ROWS.PROPERTY_PERSON_EXPENSE, col: monthColumn },
      { name: 'Month_Total_Overheads', row: CORRECT_ROWS.TOTAL_OVERHEADS, col: monthColumn },
      { name: 'Month_GOP', row: CORRECT_ROWS.GOP, col: monthColumn },
      { name: 'Month_EBITDA_Margin', row: CORRECT_ROWS.EBITDA_MARGIN, col: monthColumn },
      
      // YEAR ranges (always column Q)
      { name: 'Year_Total_Revenue', row: CORRECT_ROWS.TOTAL_REVENUE, col: 'Q' },
      { name: 'Year_Property_Person_Expense', row: CORRECT_ROWS.PROPERTY_PERSON_EXPENSE, col: 'Q' },
      { name: 'Year_Total_Overheads', row: CORRECT_ROWS.TOTAL_OVERHEADS, col: 'Q' },
      { name: 'Year_GOP', row: CORRECT_ROWS.GOP, col: 'Q' },
      { name: 'Year_EBITDA_Margin', row: CORRECT_ROWS.EBITDA_MARGIN, col: 'Q' },
    ];

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔍 Checking Current vs Correct Named Ranges...\n');

    const issues = [];
    
    for (const correct of correctRanges) {
      const existing = namedRanges.find(nr => nr.name === correct.name);
      const correctCell = `${correct.col}${correct.row}`;
      
      if (existing) {
        const currentRow = (existing.range?.startRowIndex || 0) + 1;
        const currentCol = String.fromCharCode(65 + (existing.range?.startColumnIndex || 0));
        const currentCell = `${currentCol}${currentRow}`;
        
        const isCorrect = currentCell === correctCell;
        
        console.log(`📌 ${correct.name}`);
        console.log(`   Current: ${currentCell}`);
        console.log(`   Correct: ${correctCell}`);
        console.log(`   Status: ${isCorrect ? '✅ OK' : '❌ NEEDS FIX'}`);
        console.log();
        
        if (!isCorrect) {
          issues.push({
            name: correct.name,
            current: currentCell,
            correct: correctCell,
            namedRangeId: existing.namedRangeId,
            row: correct.row,
            colIndex: correct.col.charCodeAt(0) - 65,
          });
        }
      } else {
        console.log(`📌 ${correct.name}`);
        console.log(`   Status: ⚠️  MISSING - will create`);
        console.log(`   Will create at: ${correctCell}`);
        console.log();
        
        issues.push({
          name: correct.name,
          current: 'MISSING',
          correct: correctCell,
          namedRangeId: null,
          row: correct.row,
          colIndex: correct.col.charCodeAt(0) - 65,
        });
      }
    }

    if (issues.length === 0) {
      console.log('✅ All named ranges are already correct!\n');
      return;
    }

    // Apply fixes
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`🔧 Fixing ${issues.length} Named Range(s)...\n`);

    const requests = [];

    for (const issue of issues) {
      // Delete old named range if it exists
      if (issue.namedRangeId) {
        requests.push({
          deleteNamedRange: {
            namedRangeId: issue.namedRangeId,
          },
        });
      }

      // Add new named range with correct cell
      requests.push({
        addNamedRange: {
          namedRange: {
            name: issue.name,
            range: {
              sheetId: sheetId,
              startRowIndex: issue.row - 1, // 0-based
              endRowIndex: issue.row,
              startColumnIndex: issue.colIndex,
              endColumnIndex: issue.colIndex + 1,
            },
          },
        },
      });

      console.log(`✓ Updating ${issue.name}: ${issue.current} → ${issue.correct}`);
    }

    console.log();

    // Execute batch update
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: requests,
      },
    });

    console.log(`✅ Successfully updated ${issues.length} named range(s)\n`);

    // Verify the fixes
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Verifying Fixes...\n');

    const verifyRanges = correctRanges.map(cr => `'${SHEET_NAME}'!${cr.col}${cr.row}`);
    
    const verifyResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: verifyRanges,
    });

    for (let i = 0; i < correctRanges.length; i++) {
      const cr = correctRanges[i];
      const value = verifyResponse.data.valueRanges?.[i]?.values?.[0]?.[0];
      const cell = `${cr.col}${cr.row}`;
      
      console.log(`📌 ${cr.name} (${cell}): ${typeof value === 'number' ? '฿' + value.toLocaleString() : value || '(empty)'}`);
    }

    console.log();
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 SUMMARY\n');
    console.log('✅ All named ranges have been updated to point to the correct cells!');
    console.log('\nCorrect structure:');
    console.log(`   Row ${CORRECT_ROWS.TOTAL_REVENUE}: Total Revenue`);
    console.log(`   Row ${CORRECT_ROWS.PROPERTY_PERSON_EXPENSE}: Total Property or Person Expense`);
    console.log(`   Row ${CORRECT_ROWS.TOTAL_OVERHEADS}: Total Overhead Expense`);
    console.log(`   Row ${CORRECT_ROWS.GOP}: Gross Operating Profit (GOP)`);
    console.log(`   Row ${CORRECT_ROWS.EBITDA_MARGIN}: EBITDA Margin`);
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎉 FIX COMPLETE!\n');
    console.log('📋 Next Steps:');
    console.log('1. Clear P&L cache: curl -X POST http://localhost:3001/api/pnl \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"action":"clearCache"}\'');
    console.log('2. Refresh P&L page in browser');
    console.log('3. Verify all KPIs display correctly\n');
    console.log('═══════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

fixAllNamedRanges();

