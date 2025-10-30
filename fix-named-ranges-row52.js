/**
 * Fix P&L Named Ranges to Point to Row 52 (Total Row)
 * 
 * This script:
 * 1. Uses Google Sheets API with service account
 * 2. Updates Month_Total_Overheads to point to N52 (instead of N46)
 * 3. Updates Year_Total_Overheads to point to Q52 (instead of Q46)
 * 4. Verifies the cells have the correct SUM formulas
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
const TOTAL_ROW = 52; // The row where the total should be

async function fixNamedRanges() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔧 FIX P&L NAMED RANGES - Point to Row 52');
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
      process.exit(1);
    }

    const sheetId = pnlSheet.properties?.sheetId;
    console.log(`✓ Found sheet: "${SHEET_NAME}" (ID: ${sheetId})\n`);

    // Step 1: Find current month column
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📅 Step 1: Finding Current Month Column...\n');

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

    // Step 2: Check current named ranges
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔍 Step 2: Checking Current Named Ranges...\n');

    const namedRangesResponse = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'namedRanges',
    });

    const namedRanges = namedRangesResponse.data.namedRanges || [];
    const monthOverheadsRange = namedRanges.find(nr => nr.name === 'Month_Total_Overheads');
    const yearOverheadsRange = namedRanges.find(nr => nr.name === 'Year_Total_Overheads');

    if (monthOverheadsRange) {
      const range = monthOverheadsRange.range;
      const currentRow = range?.startRowIndex ? range.startRowIndex + 1 : 'unknown';
      console.log(`📌 Month_Total_Overheads currently points to row: ${currentRow}`);
    } else {
      console.log('⚠️  Month_Total_Overheads named range not found');
    }

    if (yearOverheadsRange) {
      const range = yearOverheadsRange.range;
      const currentRow = range?.startRowIndex ? range.startRowIndex + 1 : 'unknown';
      console.log(`📌 Year_Total_Overheads currently points to row: ${currentRow}`);
    } else {
      console.log('⚠️  Year_Total_Overheads named range not found');
    }

    console.log();

    // Step 3: Verify row 52 has the correct formulas
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔍 Step 3: Checking Row 52 Formulas...\n');

    const row52Response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: [
        `'${SHEET_NAME}'!${monthColumn}${TOTAL_ROW}`,
        `'${SHEET_NAME}'!Q${TOTAL_ROW}`,
      ],
      valueRenderOption: 'FORMULA',
    });

    const monthFormula = row52Response.data.valueRanges?.[0]?.values?.[0]?.[0] || '';
    const yearFormula = row52Response.data.valueRanges?.[1]?.values?.[0]?.[0] || '';

    console.log(`📍 Cell ${monthColumn}${TOTAL_ROW} formula: ${monthFormula || '(no formula)'}`);
    console.log(`📍 Cell Q${TOTAL_ROW} formula: ${yearFormula || '(no formula)'}\n`);

    const expectedMonthFormula = `=SUM(${monthColumn}${OVERHEAD_START_ROW}:${monthColumn}${OVERHEAD_END_ROW})`;
    const expectedYearFormula = `=SUM(Q${OVERHEAD_START_ROW}:Q${OVERHEAD_END_ROW})`;

    const needsMonthFormula = monthFormula !== expectedMonthFormula;
    const needsYearFormula = yearFormula !== expectedYearFormula;

    if (needsMonthFormula || needsYearFormula) {
      console.log('⚠️  Formulas need to be updated:\n');
      
      if (needsMonthFormula) {
        console.log(`   Cell ${monthColumn}${TOTAL_ROW}:`);
        console.log(`   Current: ${monthFormula || '(empty)'}`);
        console.log(`   Should be: ${expectedMonthFormula}\n`);
      }
      
      if (needsYearFormula) {
        console.log(`   Cell Q${TOTAL_ROW}:`);
        console.log(`   Current: ${yearFormula || '(empty)'}`);
        console.log(`   Should be: ${expectedYearFormula}\n`);
      }

      // Update formulas
      console.log('🔧 Updating formulas...\n');
      
      const updates = [];
      if (needsMonthFormula) {
        updates.push({
          range: `'${SHEET_NAME}'!${monthColumn}${TOTAL_ROW}`,
          values: [[expectedMonthFormula]],
        });
      }
      if (needsYearFormula) {
        updates.push({
          range: `'${SHEET_NAME}'!Q${TOTAL_ROW}`,
          values: [[expectedYearFormula]],
        });
      }

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates,
        },
      });

      console.log(`✓ Updated ${updates.length} formula(s)\n`);
    } else {
      console.log('✓ Formulas are already correct\n');
    }

    // Step 4: Update named ranges to point to row 52
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔧 Step 4: Updating Named Ranges to Row 52...\n');

    const requests = [];

    // Delete old named ranges if they exist
    if (monthOverheadsRange?.namedRangeId) {
      requests.push({
        deleteNamedRange: {
          namedRangeId: monthOverheadsRange.namedRangeId,
        },
      });
    }

    if (yearOverheadsRange?.namedRangeId) {
      requests.push({
        deleteNamedRange: {
          namedRangeId: yearOverheadsRange.namedRangeId,
        },
      });
    }

    // Add new named ranges pointing to row 52
    requests.push({
      addNamedRange: {
        namedRange: {
          name: 'Month_Total_Overheads',
          range: {
            sheetId: sheetId,
            startRowIndex: TOTAL_ROW - 1, // 0-based index
            endRowIndex: TOTAL_ROW,
            startColumnIndex: monthColumnIndex,
            endColumnIndex: monthColumnIndex + 1,
          },
        },
      },
    });

    requests.push({
      addNamedRange: {
        namedRange: {
          name: 'Year_Total_Overheads',
          range: {
            sheetId: sheetId,
            startRowIndex: TOTAL_ROW - 1, // 0-based index
            endRowIndex: TOTAL_ROW,
            startColumnIndex: 16, // Column Q (0-based: Q = 16)
            endColumnIndex: 17,
          },
        },
      },
    });

    // Execute the batch update
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: requests,
      },
    });

    console.log('✓ Updated Month_Total_Overheads → ' + monthColumn + TOTAL_ROW);
    console.log('✓ Updated Year_Total_Overheads → Q' + TOTAL_ROW + '\n');

    // Step 5: Verify the fix
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Step 5: Verifying Named Ranges...\n');

    const verifyResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: [
        `'${SHEET_NAME}'!${monthColumn}${TOTAL_ROW}`,
        `'${SHEET_NAME}'!Q${TOTAL_ROW}`,
      ],
    });

    const monthValue = verifyResponse.data.valueRanges?.[0]?.values?.[0]?.[0] || 0;
    const yearValue = verifyResponse.data.valueRanges?.[1]?.values?.[0]?.[0] || 0;

    console.log(`📍 ${monthColumn}${TOTAL_ROW} (Month_Total_Overheads): ฿${monthValue.toLocaleString()}`);
    console.log(`📍 Q${TOTAL_ROW} (Year_Total_Overheads): ฿${yearValue.toLocaleString()}\n`);

    // Summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 SUMMARY\n');
    console.log('✅ Named ranges updated successfully!');
    console.log(`✅ Month_Total_Overheads → ${monthColumn}${TOTAL_ROW} (${currentMonth})`);
    console.log(`✅ Year_Total_Overheads → Q${TOTAL_ROW}`);
    console.log(`✅ Month overhead total: ฿${monthValue.toLocaleString()}`);
    console.log(`✅ Year overhead total: ฿${yearValue.toLocaleString()}\n`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🎉 FIX COMPLETE!\n');
    console.log('📋 Next Steps:');
    console.log('1. Clear P&L cache: curl -X POST http://localhost:3001/api/pnl \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"action":"clearCache"}\'');
    console.log('2. Refresh P&L page in browser');
    console.log('3. Verify overhead expenses display correctly\n');
    console.log('═══════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the fix
fixNamedRanges();

