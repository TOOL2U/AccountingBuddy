/**
 * Sync P&L Named Ranges using Google Sheets API
 * 
 * This script:
 * 1. Uses service account to access Google Sheets API directly
 * 2. Checks the current values in cells N46 and Q46
 * 3. Checks if they have formulas or just values
 * 4. Verifies the sum of overhead expenses (rows 29-51)
 * 5. Fixes the formulas if needed
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
const OVERHEAD_START_ROW = 29;
const OVERHEAD_END_ROW = 51;

async function syncPnLRanges() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔄 P&L NAMED RANGES SYNC (Google Sheets API)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Authenticate with service account
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
    });

    // Find the P&L sheet
    const pnlSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === SHEET_NAME
    );

    if (!pnlSheet) {
      console.error(`❌ Sheet "${SHEET_NAME}" not found!`);
      console.log('\nAvailable sheets:');
      spreadsheet.data.sheets?.forEach(sheet => {
        console.log(`  - ${sheet.properties?.title}`);
      });
      process.exit(1);
    }

    const sheetId = pnlSheet.properties?.sheetId;
    console.log(`✓ Found sheet: "${SHEET_NAME}" (ID: ${sheetId})\n`);

    // Step 1: Get current month column (find October in row 4)
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📅 Step 1: Finding Current Month Column...\n');

    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A4:Z4`,
    });

    const headers = headerResponse.data.values?.[0] || [];
    const currentMonth = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'][new Date().getMonth()];
    
    let monthColumnIndex = headers.findIndex(h => 
      h && h.toString().toUpperCase().trim() === currentMonth
    );

    if (monthColumnIndex === -1) {
      console.error(`❌ Could not find ${currentMonth} in header row`);
      console.log('Available headers:', headers.filter(h => h).join(', '));
      process.exit(1);
    }

    const monthColumn = String.fromCharCode(65 + monthColumnIndex); // Convert to letter (A=0)
    console.log(`✓ Current month: ${currentMonth}`);
    console.log(`✓ Month column: ${monthColumn} (index ${monthColumnIndex})\n`);

    // Step 2: Check current values and formulas in cells N46 and Q46
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔍 Step 2: Checking Total Overhead Cells...\n');

    const monthTotalCell = `${monthColumn}46`;
    const yearTotalCell = 'Q46';

    // Get values
    const valuesResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: [
        `'${SHEET_NAME}'!${monthTotalCell}`,
        `'${SHEET_NAME}'!${yearTotalCell}`,
      ],
    });

    const monthValue = valuesResponse.data.valueRanges?.[0]?.values?.[0]?.[0] || 0;
    const yearValue = valuesResponse.data.valueRanges?.[1]?.values?.[0]?.[0] || 0;

    // Get formulas
    const formulasResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: [
        `'${SHEET_NAME}'!${monthTotalCell}`,
        `'${SHEET_NAME}'!${yearTotalCell}`,
      ],
      valueRenderOption: 'FORMULA',
    });

    const monthFormula = formulasResponse.data.valueRanges?.[0]?.values?.[0]?.[0] || null;
    const yearFormula = formulasResponse.data.valueRanges?.[1]?.values?.[0]?.[0] || null;

    console.log(`📍 Cell ${monthTotalCell} (Month Total Overheads):`);
    console.log(`   Value: ${monthValue}`);
    console.log(`   Formula: ${monthFormula || '(no formula)'}\n`);

    console.log(`📍 Cell ${yearTotalCell} (Year Total Overheads):`);
    console.log(`   Value: ${yearValue}`);
    console.log(`   Formula: ${yearFormula || '(no formula)'}\n`);

    // Step 3: Get overhead expenses (rows 29-51) and calculate sum
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('💰 Step 3: Calculating Actual Overhead Expenses...\n');

    const monthOverheadsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!${monthColumn}${OVERHEAD_START_ROW}:${monthColumn}${OVERHEAD_END_ROW}`,
    });

    const yearOverheadsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!Q${OVERHEAD_START_ROW}:Q${OVERHEAD_END_ROW}`,
    });

    const monthExpenses = monthOverheadsResponse.data.values?.map(row => parseFloat(row[0]) || 0) || [];
    const yearExpenses = yearOverheadsResponse.data.values?.map(row => parseFloat(row[0]) || 0) || [];

    const monthSum = monthExpenses.reduce((sum, val) => sum + val, 0);
    const yearSum = yearExpenses.reduce((sum, val) => sum + val, 0);

    console.log(`📊 Overhead Expenses (Rows ${OVERHEAD_START_ROW}-${OVERHEAD_END_ROW}):`);
    console.log(`   Month (Column ${monthColumn}): ฿${monthSum.toLocaleString()}`);
    console.log(`   Year (Column Q): ฿${yearSum.toLocaleString()}\n`);

    // Step 4: Analysis and Fix
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔬 Step 4: Analysis & Fix...\n');

    const fixes = [];

    // Check month cell
    const expectedMonthFormula = `=SUM(${monthColumn}${OVERHEAD_START_ROW}:${monthColumn}${OVERHEAD_END_ROW})`;
    if (monthFormula !== expectedMonthFormula || parseFloat(monthValue) !== monthSum) {
      console.log(`❌ Cell ${monthTotalCell} needs fixing:`);
      console.log(`   Current: ${monthFormula || monthValue}`);
      console.log(`   Expected: ${expectedMonthFormula}`);
      console.log(`   Current value: ฿${parseFloat(monthValue || 0).toLocaleString()}`);
      console.log(`   Should be: ฿${monthSum.toLocaleString()}\n`);
      
      fixes.push({
        range: `'${SHEET_NAME}'!${monthTotalCell}`,
        values: [[expectedMonthFormula]]
      });
    } else {
      console.log(`✓ Cell ${monthTotalCell} is correct\n`);
    }

    // Check year cell
    const expectedYearFormula = `=SUM(Q${OVERHEAD_START_ROW}:Q${OVERHEAD_END_ROW})`;
    if (yearFormula !== expectedYearFormula || parseFloat(yearValue) !== yearSum) {
      console.log(`❌ Cell ${yearTotalCell} needs fixing:`);
      console.log(`   Current: ${yearFormula || yearValue}`);
      console.log(`   Expected: ${expectedYearFormula}`);
      console.log(`   Current value: ฿${parseFloat(yearValue || 0).toLocaleString()}`);
      console.log(`   Should be: ฿${yearSum.toLocaleString()}\n`);
      
      fixes.push({
        range: `'${SHEET_NAME}'!${yearTotalCell}`,
        values: [[expectedYearFormula]]
      });
    } else {
      console.log(`✓ Cell ${yearTotalCell} is correct\n`);
    }

    // Apply fixes
    if (fixes.length > 0) {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('🔧 Applying Fixes...\n');

      for (const fix of fixes) {
        console.log(`📝 Updating ${fix.range} with formula: ${fix.values[0][0]}`);
        
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: fix.range,
          valueInputOption: 'USER_ENTERED', // This interprets formulas
          requestBody: {
            values: fix.values,
          },
        });
        
        console.log('   ✓ Updated successfully');
      }

      console.log(`\n✅ Fixed ${fixes.length} cell${fixes.length > 1 ? 's' : ''}\n`);

      // Verify the fixes
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('✅ Step 5: Verifying Fixes...\n');

      const verifyResponse = await sheets.spreadsheets.values.batchGet({
        spreadsheetId: SPREADSHEET_ID,
        ranges: [
          `'${SHEET_NAME}'!${monthTotalCell}`,
          `'${SHEET_NAME}'!${yearTotalCell}`,
        ],
      });

      const newMonthValue = verifyResponse.data.valueRanges?.[0]?.values?.[0]?.[0] || 0;
      const newYearValue = verifyResponse.data.valueRanges?.[1]?.values?.[0]?.[0] || 0;

      console.log(`📍 Cell ${monthTotalCell}: ฿${parseFloat(newMonthValue).toLocaleString()} ${parseFloat(newMonthValue) === monthSum ? '✓' : '❌'}`);
      console.log(`📍 Cell ${yearTotalCell}: ฿${parseFloat(newYearValue).toLocaleString()} ${parseFloat(newYearValue) === yearSum ? '✓' : '❌'}\n`);

    } else {
      console.log('✅ All cells are correct! No fixes needed.\n');
    }

    // Final summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 SUMMARY\n');
    console.log(`✓ Spreadsheet: ${spreadsheet.data.properties?.title}`);
    console.log(`✓ Sheet: ${SHEET_NAME}`);
    console.log(`✓ Current Month: ${currentMonth} (Column ${monthColumn})`);
    console.log(`✓ Month Overheads (${monthTotalCell}): ฿${monthSum.toLocaleString()}`);
    console.log(`✓ Year Overheads (${yearTotalCell}): ฿${yearSum.toLocaleString()}`);
    console.log(`✓ Formula: =SUM(${monthColumn}${OVERHEAD_START_ROW}:${monthColumn}${OVERHEAD_END_ROW})`);
    console.log(`✓ Overhead rows: ${OVERHEAD_START_ROW}-${OVERHEAD_END_ROW}`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Sync Complete!');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Next steps
    console.log('📋 Next Steps:');
    console.log('1. Clear P&L cache: curl -X POST http://localhost:3000/api/pnl -d \'{"action":"clearCache"}\'');
    console.log('2. Refresh P&L dashboard in browser');
    console.log('3. Verify overhead expenses display correctly\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run the sync
syncPnLRanges();
