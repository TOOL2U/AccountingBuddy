/**
 * Fix P&L Named Ranges and Formulas After New Expense Row Added
 * 
 * Issues to fix:
 * 1. Named ranges shifted down by 1 row (need to update to 53, 56, 57)
 * 2. Total Overhead Expense formula needs to include row 52
 */

require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_FILE = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!SPREADSHEET_ID || !SERVICE_ACCOUNT_FILE) {
  console.error('❌ Missing environment variables');
  console.error('Need: GOOGLE_SHEET_ID and GOOGLE_APPLICATION_CREDENTIALS');
  process.exit(1);
}

// Correct row numbers after new expense was added
const CORRECT_ROWS = {
  TOTAL_REVENUE: 11,
  PROPERTY_PERSON_EXPENSE: 20,
  TOTAL_OVERHEADS: 53,  // Changed from 52 to 53
  GOP: 56,              // Changed from 55 to 56
  EBITDA_MARGIN: 57,    // Changed from 56 to 57
};

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔧 FIX P&L AFTER NEW EXPENSE ROW ADDED');
  console.log('═══════════════════════════════════════════════════════════════\n');

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
  });

  const pnlSheet = spreadsheet.data.sheets?.find(
    (sheet) => sheet.properties?.title === 'P&L (DO NOT EDIT)'
  );

  if (!pnlSheet) {
    console.error('❌ Could not find "P&L (DO NOT EDIT)" sheet');
    process.exit(1);
  }

  const sheetId = pnlSheet.properties?.sheetId;
  console.log(`✓ Found sheet: "P&L (DO NOT EDIT)" (ID: ${sheetId})\n`);

  // Find current month column
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📅 Finding Current Month Column...\n');

  const headerRow = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'P&L (DO NOT EDIT)!A4:Z4',
  });

  const headers = headerRow.data.values?.[0] || [];
  const currentMonth = new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase();
  console.log('Looking for month:', currentMonth);
  console.log('Headers:', headers);
  const monthColIndex = headers.findIndex(h => h?.toUpperCase() === currentMonth);

  if (monthColIndex === -1) {
    console.error(`❌ Could not find column for month: ${currentMonth}`);
    process.exit(1);
  }

  const monthColumnLetter = String.fromCharCode(65 + monthColIndex);
  console.log(`✓ Current month: ${currentMonth}`);
  console.log(`✓ Month column: ${monthColumnLetter} (index ${monthColIndex})\n`);

  // Step 1: Fix the Total Overhead Expense formula to include row 52
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔧 STEP 1: Fix Total Overhead Expense Formula\n');

  const overheadRow = CORRECT_ROWS.TOTAL_OVERHEADS;
  
  // Update formulas for both month column and year column (Q)
  const formulaUpdates = [
    {
      range: `P&L (DO NOT EDIT)!${monthColumnLetter}${overheadRow}`,
      values: [[`=SUM(${monthColumnLetter}29:${monthColumnLetter}52)`]]
    },
    {
      range: `P&L (DO NOT EDIT)!Q${overheadRow}`,
      values: [[`=SUM(Q29:Q52)`]]
    }
  ];

  console.log(`Updating formula in ${monthColumnLetter}${overheadRow} to: =SUM(${monthColumnLetter}29:${monthColumnLetter}52)`);
  console.log(`Updating formula in Q${overheadRow} to: =SUM(Q29:Q52)\n`);

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: formulaUpdates
    }
  });

  console.log('✅ Formulas updated successfully\n');

  // Step 2: Update named ranges
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔧 STEP 2: Update Named Ranges\n');

  // Get all named ranges
  const namedRanges = spreadsheet.data.namedRanges || [];
  const pnlNamedRanges = namedRanges.filter(nr => 
    nr.name?.includes('Month_') || nr.name?.includes('Year_')
  );

  console.log(`Found ${pnlNamedRanges.length} P&L named ranges\n`);

  // Define correct named ranges
  const correctNamedRanges = [
    { name: 'Month_Total_Revenue', row: CORRECT_ROWS.TOTAL_REVENUE, col: monthColIndex },
    { name: 'Month_Property_Person_Expense', row: CORRECT_ROWS.PROPERTY_PERSON_EXPENSE, col: monthColIndex },
    { name: 'Month_Total_Overheads', row: CORRECT_ROWS.TOTAL_OVERHEADS, col: monthColIndex },
    { name: 'Month_GOP', row: CORRECT_ROWS.GOP, col: monthColIndex },
    { name: 'Month_EBITDA_Margin', row: CORRECT_ROWS.EBITDA_MARGIN, col: monthColIndex },
    { name: 'Year_Total_Revenue', row: CORRECT_ROWS.TOTAL_REVENUE, col: 16 }, // Q = 16
    { name: 'Year_Property_Person_Expense', row: CORRECT_ROWS.PROPERTY_PERSON_EXPENSE, col: 16 },
    { name: 'Year_Total_Overheads', row: CORRECT_ROWS.TOTAL_OVERHEADS, col: 16 },
    { name: 'Year_GOP', row: CORRECT_ROWS.GOP, col: 16 },
    { name: 'Year_EBITDA_Margin', row: CORRECT_ROWS.EBITDA_MARGIN, col: 16 },
  ];

  // Find which named ranges need updating
  const requests = [];

  for (const correctRange of correctNamedRanges) {
    const existingRange = pnlNamedRanges.find(nr => nr.name === correctRange.name);
    
    if (existingRange) {
      const currentRow = (existingRange.range?.startRowIndex || 0) + 1;
      const currentCol = existingRange.range?.startColumnIndex || 0;
      
      if (currentRow !== correctRange.row || currentCol !== correctRange.col) {
        console.log(`📌 ${correctRange.name}:`);
        console.log(`   Current: Row ${currentRow}, Col ${currentCol}`);
        console.log(`   Correct: Row ${correctRange.row}, Col ${correctRange.col}`);
        console.log(`   → Will update\n`);

        // Delete old named range
        requests.push({
          deleteNamedRange: {
            namedRangeId: existingRange.namedRangeId,
          },
        });

        // Add new named range with correct position
        requests.push({
          addNamedRange: {
            namedRange: {
              name: correctRange.name,
              range: {
                sheetId: sheetId,
                startRowIndex: correctRange.row - 1,
                endRowIndex: correctRange.row,
                startColumnIndex: correctRange.col,
                endColumnIndex: correctRange.col + 1,
              },
            },
          },
        });
      } else {
        console.log(`✓ ${correctRange.name} is already correct (Row ${correctRange.row})\n`);
      }
    }
  }

  if (requests.length > 0) {
    console.log(`\n🔄 Updating ${requests.length / 2} named ranges...\n`);

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: requests,
      },
    });

    console.log('✅ Named ranges updated successfully\n');
  } else {
    console.log('✅ All named ranges are already correct\n');
  }

  // Step 3: Verify the fixes
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✅ VERIFICATION\n');

  // Read the updated values
  const verifyRanges = [
    `P&L (DO NOT EDIT)!${monthColumnLetter}${CORRECT_ROWS.TOTAL_OVERHEADS}`,
    `P&L (DO NOT EDIT)!Q${CORRECT_ROWS.TOTAL_OVERHEADS}`,
  ];

  const verifyResult = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: verifyRanges,
  });

  console.log(`Month Total Overheads (${monthColumnLetter}${CORRECT_ROWS.TOTAL_OVERHEADS}):`, verifyResult.data.valueRanges?.[0]?.values?.[0]?.[0] || 'empty');
  console.log(`Year Total Overheads (Q${CORRECT_ROWS.TOTAL_OVERHEADS}):`, verifyResult.data.valueRanges?.[1]?.values?.[0]?.[0] || 'empty');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL FIXES COMPLETED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('📋 Summary of changes:');
  console.log('1. ✅ Updated Total Overhead Expense formula to include row 52');
  console.log('2. ✅ Updated named ranges to point to rows 53, 56, 57');
  console.log('\n💡 Next steps:');
  console.log('1. Clear P&L cache: curl -X POST http://localhost:3000/api/pnl -H "Content-Type: application/json" -d \'{"action":"clearCache"}\'');
  console.log('2. Verify P&L page shows correct overhead values');
  console.log('3. Update Apps Script code to use new row numbers (53, 56, 57)');
}

main().catch(console.error);

