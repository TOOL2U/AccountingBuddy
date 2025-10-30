/**
 * Check what's in N46 and Q46 cells
 */

const { google } = require('googleapis');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function checkCells() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, 'accounting-buddy-476114-82555a53603b.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    console.log('Checking cells N46 and Q46...\n');

    // Get formulas
    const formulaResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      ranges: [
        "'P&L (DO NOT EDIT)'!N46",
        "'P&L (DO NOT EDIT)'!Q46",
        "'P&L (DO NOT EDIT)'!A46"
      ],
      valueRenderOption: 'FORMULA'
    });

    // Get values
    const valueResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      ranges: [
        "'P&L (DO NOT EDIT)'!N46",
        "'P&L (DO NOT EDIT)'!Q46",
        "'P&L (DO NOT EDIT)'!A46"
      ]
    });

    const n46Formula = formulaResponse.data.valueRanges?.[0]?.values?.[0]?.[0];
    const q46Formula = formulaResponse.data.valueRanges?.[1]?.values?.[0]?.[0];
    const a46Label = formulaResponse.data.valueRanges?.[2]?.values?.[0]?.[0];

    const n46Value = valueResponse.data.valueRanges?.[0]?.values?.[0]?.[0];
    const q46Value = valueResponse.data.valueRanges?.[1]?.values?.[0]?.[0];

    console.log('Cell A46 (Label):');
    console.log(`  "${a46Label || '(empty)'}"`);
    console.log('');

    console.log('Cell N46 (Month_Total_Overheads):');
    console.log(`  Formula: ${n46Formula || '(no formula - just a value)'}`);
    console.log(`  Value: ${n46Value || '(empty)'}`);
    console.log('');

    console.log('Cell Q46 (Year_Total_Overheads):');
    console.log(`  Formula: ${q46Formula || '(no formula - just a value)'}`);
    console.log(`  Value: ${q46Value || '(empty)'}`);
    console.log('');

    // Now check what should be summed
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Checking what N29:N51 contains...\n');

    const rangeResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "'P&L (DO NOT EDIT)'!N29:N51"
    });

    const values = rangeResponse.data.values || [];
    let sum = 0;
    let nonZeroCount = 0;

    values.forEach((row, i) => {
      const val = parseFloat(row[0]) || 0;
      sum += val;
      if (val !== 0) {
        console.log(`Row ${29 + i}: ${val}`);
        nonZeroCount++;
      }
    });

    console.log('');
    console.log(`Sum of N29:N51: ฿${sum.toLocaleString()}`);
    console.log(`Non-zero cells: ${nonZeroCount}`);
    console.log('');

    if (sum !== parseFloat(n46Value || 0)) {
      console.log('❌ MISMATCH: Cell N46 should be ฿' + sum.toLocaleString() + ' but is ' + n46Value);
    } else {
      console.log('✓ Cell N46 is correct!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCells();
