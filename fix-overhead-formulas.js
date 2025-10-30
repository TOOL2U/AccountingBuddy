/**
 * Fix P&L Overhead Total Formulas
 * This script will:
 * 1. Find where "EXP - HR - Employees Salaries" actually is
 * 2. Determine the correct row range for overhead expenses
 * 3. Update cells N46 and Q46 with correct SUM formulas
 */

const { google } = require('googleapis');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'accounting-buddy-476114-82555a53603b.json');
const SHEET_NAME = 'P&L (DO NOT EDIT)';

async function fixOverheadFormulas() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔧 FIXING P&L OVERHEAD TOTAL FORMULAS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Step 1: Find the actual overhead expense rows
    console.log('📊 Step 1: Finding Overhead Expense Rows...\n');

    const columnAResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A:A`,
    });

    const columnA = columnAResponse.data.values || [];
    
    // Find all rows that start with "EXP -"
    const expenseRows = [];
    columnA.forEach((row, index) => {
      if (row[0] && row[0].toString().trim().startsWith('EXP -')) {
        expenseRows.push({
          row: index + 1,
          name: row[0].toString().trim()
        });
      }
    });

    if (expenseRows.length === 0) {
      console.error('❌ No expense rows found starting with "EXP -"');
      process.exit(1);
    }

    const firstRow = expenseRows[0].row;
    const lastRow = expenseRows[expenseRows.length - 1].row;

    console.log(`✓ Found ${expenseRows.length} overhead expense rows`);
    console.log(`✓ First expense: Row ${firstRow} - ${expenseRows[0].name}`);
    console.log(`✓ Last expense: Row ${lastRow} - ${expenseRows[expenseRows.length - 1].name}\n`);

    // Step 2: Find where "Total Overheads" label is
    console.log('📊 Step 2: Finding "Total Overheads" Row...\n');

    let totalRow = null;
    for (let i = lastRow; i < lastRow + 10; i++) {
      const cellValue = columnA[i - 1]?.[0];
      if (cellValue && cellValue.toString().toLowerCase().includes('total') && 
          cellValue.toString().toLowerCase().includes('overhead')) {
        totalRow = i;
        console.log(`✓ Found "Total Overheads" at row ${i}: "${cellValue}"\n`);
        break;
      }
    }

    if (!totalRow) {
      console.log('⚠️  Could not find "Total Overheads" label');
      console.log('   Using default: last expense row + 5\n');
      totalRow = lastRow + 5;
    }

    // Step 3: Find October column
    console.log('📊 Step 3: Finding October Column...\n');

    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A4:Z4`,
    });

    const headers = headerResponse.data.values?.[0] || [];
    const octIndex = headers.findIndex(h => h && h.toString().toUpperCase().trim() === 'OCT');

    if (octIndex === -1) {
      console.error('❌ Could not find OCT column');
      process.exit(1);
    }

    const octColumn = String.fromCharCode(65 + octIndex);
    console.log(`✓ Found OCT in column ${octColumn}\n`);

    // Step 4: Create the formulas
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔧 Step 4: Creating Formulas...\n');

    const monthFormula = `=SUM(${octColumn}${firstRow}:${octColumn}${lastRow})`;
    const yearFormula = `=SUM(Q${firstRow}:Q${lastRow})`;

    console.log(`Month formula for cell ${octColumn}${totalRow}:`);
    console.log(`  ${monthFormula}\n`);

    console.log(`Year formula for cell Q${totalRow}:`);
    console.log(`  ${yearFormula}\n`);

    // Step 5: Apply the formulas
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📝 Step 5: Applying Formulas...\n');

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: `'${SHEET_NAME}'!${octColumn}${totalRow}`,
            values: [[monthFormula]]
          },
          {
            range: `'${SHEET_NAME}'!Q${totalRow}`,
            values: [[yearFormula]]
          }
        ]
      }
    });

    console.log(`✓ Updated ${octColumn}${totalRow} with: ${monthFormula}`);
    console.log(`✓ Updated Q${totalRow} with: ${yearFormula}\n`);

    // Step 6: Verify
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Step 6: Verifying...\n');

    // Wait a moment for the sheet to recalculate
    await new Promise(resolve => setTimeout(resolve, 1000));

    const verifyResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: [
        `'${SHEET_NAME}'!${octColumn}${totalRow}`,
        `'${SHEET_NAME}'!Q${totalRow}`,
      ],
    });

    const monthValue = verifyResponse.data.valueRanges?.[0]?.values?.[0]?.[0];
    const yearValue = verifyResponse.data.valueRanges?.[1]?.values?.[0]?.[0];

    console.log(`Cell ${octColumn}${totalRow} (Month): ${monthValue}`);
    console.log(`Cell Q${totalRow} (Year): ${yearValue}\n`);

    // Final summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ COMPLETE!\n');
    console.log('Summary:');
    console.log(`  - Overhead expense rows: ${firstRow} to ${lastRow} (${expenseRows.length} items)`);
    console.log(`  - Total row: ${totalRow}`);
    console.log(`  - Month total (${octColumn}${totalRow}): ฿${parseFloat(monthValue || 0).toLocaleString()}`);
    console.log(`  - Year total (Q${totalRow}): ฿${parseFloat(yearValue || 0).toLocaleString()}`);
    console.log('');
    console.log('Next: Run the named ranges sync to update named range pointers');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
    process.exit(1);
  }
}

fixOverheadFormulas();
