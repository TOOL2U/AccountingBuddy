/**
 * Deep dive into overhead expenses cells
 * Read the actual cell values in rows 29-51, column N
 */

const { google } = require('googleapis');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'accounting-buddy-476114-82555a53603b.json');
const SHEET_NAME = 'P&L (DO NOT EDIT)';

async function inspectCells() {
  console.log('🔍 Inspecting Overhead Expense Cells\n');

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get expense names (Column A)
    const namesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A29:A51`,
    });

    // Get October values (Column N)
    const octResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!N29:N51`,
    });

    // Get Year values (Column Q)
    const yearResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!Q29:Q51`,
    });

    const names = namesResponse.data.values || [];
    const octValues = octResponse.data.values || [];
    const yearValues = yearResponse.data.values || [];

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 OVERHEAD EXPENSES (Rows 29-51)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('Row | Name | October (N) | Year (Q)');
    console.log('----|---------------------------------------------------------|------------|--------');

    let octTotal = 0;
    let yearTotal = 0;

    for (let i = 0; i < 23; i++) {
      const row = 29 + i;
      const name = names[i]?.[0] || '(empty)';
      const octVal = parseFloat(octValues[i]?.[0]) || 0;
      const yearVal = parseFloat(yearValues[i]?.[0]) || 0;

      octTotal += octVal;
      yearTotal += yearVal;

      if (octVal > 0 || yearVal > 0) {
        console.log(`${row} | ${name.padEnd(55)} | ฿${octVal.toLocaleString().padStart(10)} | ฿${yearVal.toLocaleString().padStart(10)}`);
      }
    }

    console.log('----|---------------------------------------------------------|------------|--------');
    console.log(`    | TOTAL (SUM of rows 29-51)                               | ฿${octTotal.toLocaleString().padStart(10)} | ฿${yearTotal.toLocaleString().padStart(10)}`);
    console.log('');

    // Check cells N46 and Q46
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📍 TOTAL CELLS (N46 and Q46)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const n46Response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!N46`,
    });

    const q46Response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!Q46`,
    });

    const n46FormulaResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!N46`,
      valueRenderOption: 'FORMULA',
    });

    const q46FormulaResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!Q46`,
      valueRenderOption: 'FORMULA',
    });

    const n46Value = n46Response.data.values?.[0]?.[0];
    const q46Value = q46Response.data.values?.[0]?.[0];
    const n46Formula = n46FormulaResponse.data.values?.[0]?.[0];
    const q46Formula = q46FormulaResponse.data.values?.[0]?.[0];

    console.log('Cell N46 (Month_Total_Overheads):');
    console.log(`  Formula: ${n46Formula || '(no formula)'}`);
    console.log(`  Value: ${n46Value || '(empty)'}`);
    console.log(`  Expected: ฿${octTotal.toLocaleString()}`);
    console.log(`  Match: ${parseFloat(n46Value || 0) === octTotal ? '✓' : '❌'}\n`);

    console.log('Cell Q46 (Year_Total_Overheads):');
    console.log(`  Formula: ${q46Formula || '(no formula)'}`);
    console.log(`  Value: ${q46Value || '(empty)'}`);
    console.log(`  Expected: ฿${yearTotal.toLocaleString()}`);
    console.log(`  Match: ${parseFloat(q46Value || 0) === yearTotal ? '✓' : '❌'}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

inspectCells();
