/**
 * Check All P&L Named Ranges
 * 
 * This script:
 * 1. Lists all named ranges in the spreadsheet
 * 2. Checks which ones are P&L-related
 * 3. Verifies they point to the correct cells
 * 4. Shows the actual values and formulas
 * 5. Identifies any issues
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

// Expected structure based on the Apps Script code
const EXPECTED_RANGES = {
  // Month ranges (dynamic column based on current month)
  'Month_Total_Revenue': { row: 11, description: 'Total Revenue for current month' },
  'Month_Property_Person_Expense': { row: 20, description: 'Property/Person Expense for current month' },
  'Month_Total_Overheads': { row: 52, description: 'Total Overhead Expense for current month' },
  'Month_GOP': { row: 49, description: 'Gross Operating Profit for current month' },
  'Month_EBITDA_Margin': { row: 50, description: 'EBITDA Margin for current month' },
  
  // Year ranges (always column Q)
  'Year_Total_Revenue': { row: 11, col: 'Q', description: 'Total Revenue for year' },
  'Year_Property_Person_Expense': { row: 20, col: 'Q', description: 'Property/Person Expense for year' },
  'Year_Total_Overheads': { row: 52, col: 'Q', description: 'Total Overhead Expense for year' },
  'Year_GOP': { row: 49, col: 'Q', description: 'Gross Operating Profit for year' },
  'Year_EBITDA_Margin': { row: 50, col: 'Q', description: 'EBITDA Margin for year' },
};

async function checkAllNamedRanges() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 CHECK ALL P&L NAMED RANGES');
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

    // Find the P&L sheet
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

    // Get all named ranges
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 Fetching All Named Ranges...\n');

    const namedRanges = spreadsheet.data.namedRanges || [];
    const pnlRelatedRanges = namedRanges.filter(nr => 
      nr.name?.includes('Month_') || nr.name?.includes('Year_')
    );

    console.log(`✓ Found ${namedRanges.length} total named ranges`);
    console.log(`✓ Found ${pnlRelatedRanges.length} P&L-related named ranges\n`);

    // Check each P&L named range
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔍 CHECKING EACH NAMED RANGE...\n');

    const issues = [];
    const rangesToCheck = [];

    for (const nr of pnlRelatedRanges) {
      const name = nr.name || '';
      const range = nr.range;
      
      if (!range || range.sheetId !== sheetId) {
        continue; // Skip ranges not on P&L sheet
      }

      const startRow = (range.startRowIndex || 0) + 1; // Convert to 1-based
      const startCol = range.startColumnIndex || 0;
      const colLetter = String.fromCharCode(65 + startCol);
      const cellRef = `${colLetter}${startRow}`;

      // Check if this matches expected structure
      const expected = EXPECTED_RANGES[name];
      
      console.log(`📌 ${name}`);
      console.log(`   Cell: ${cellRef}`);
      
      if (expected) {
        const expectedCol = expected.col || monthColumn;
        const expectedCell = `${expectedCol}${expected.row}`;
        const isCorrect = cellRef === expectedCell;
        
        console.log(`   Expected: ${expectedCell}`);
        console.log(`   Status: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
        
        if (!isCorrect) {
          issues.push({
            name,
            current: cellRef,
            expected: expectedCell,
            description: expected.description,
          });
        }
      } else {
        console.log(`   Status: ⚠️  Not in expected list (might be custom)`);
      }

      // Add to ranges to fetch values
      rangesToCheck.push({
        name,
        range: `'${SHEET_NAME}'!${cellRef}`,
      });

      console.log();
    }

    // Fetch values and formulas for all ranges
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 FETCHING VALUES AND FORMULAS...\n');

    const valueRanges = rangesToCheck.map(r => r.range);
    
    const valuesResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: valueRanges,
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const formulasResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: valueRanges,
      valueRenderOption: 'FORMULA',
    });

    for (let i = 0; i < rangesToCheck.length; i++) {
      const { name, range } = rangesToCheck[i];
      const value = valuesResponse.data.valueRanges?.[i]?.values?.[0]?.[0];
      const formula = formulasResponse.data.valueRanges?.[i]?.values?.[0]?.[0];

      console.log(`📌 ${name} (${range.replace(`'${SHEET_NAME}'!`, '')})`);
      
      if (formula && formula.toString().startsWith('=')) {
        console.log(`   Formula: ${formula}`);
      }
      
      if (value !== undefined && value !== null) {
        if (typeof value === 'number') {
          console.log(`   Value: ${value.toLocaleString()}`);
        } else {
          console.log(`   Value: ${value}`);
        }
      } else {
        console.log(`   Value: (empty)`);
      }
      
      console.log();
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 SUMMARY\n');

    if (issues.length === 0) {
      console.log('✅ All named ranges are pointing to the correct cells!\n');
    } else {
      console.log(`❌ Found ${issues.length} issue(s):\n`);
      
      for (const issue of issues) {
        console.log(`   ${issue.name}:`);
        console.log(`   - Current: ${issue.current}`);
        console.log(`   - Expected: ${issue.expected}`);
        console.log(`   - Description: ${issue.description}`);
        console.log();
      }
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 NAMED RANGES BREAKDOWN\n');
    console.log(`Total named ranges in spreadsheet: ${namedRanges.length}`);
    console.log(`P&L-related named ranges: ${pnlRelatedRanges.length}`);
    console.log(`Expected P&L named ranges: ${Object.keys(EXPECTED_RANGES).length}`);
    
    const foundNames = pnlRelatedRanges.map(nr => nr.name);
    const expectedNames = Object.keys(EXPECTED_RANGES);
    const missing = expectedNames.filter(name => !foundNames.includes(name));
    
    if (missing.length > 0) {
      console.log(`\n⚠️  Missing named ranges: ${missing.join(', ')}`);
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════');

    if (issues.length > 0) {
      console.log('\n💡 To fix these issues, you can:');
      console.log('1. Run the Apps Script function: createPnLNamedRanges()');
      console.log('2. Or manually update the named ranges in Google Sheets');
      console.log('3. Or create a fix script similar to fix-named-ranges-row52.js\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the check
checkAllNamedRanges();

