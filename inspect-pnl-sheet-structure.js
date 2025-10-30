/**
 * Inspect P&L Sheet Structure
 * 
 * This script reads the entire P&L sheet to understand the actual structure
 * and identify where totals should be
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

async function inspectSheet() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 INSPECT P&L SHEET STRUCTURE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get column A to see all row labels
    console.log('📋 Fetching Column A (Row Labels)...\n');
    
    const columnAResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A1:A60`,
    });

    const columnA = columnAResponse.data.values || [];

    // Find key rows
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔍 KEY ROWS IN SHEET:\n');

    const keyRows = [];
    
    columnA.forEach((row, index) => {
      const rowNum = index + 1;
      const label = row[0] ? row[0].toString().trim() : '';
      
      if (label.toLowerCase().includes('revenue') ||
          label.toLowerCase().includes('property') ||
          label.toLowerCase().includes('person') ||
          label.toLowerCase().includes('overhead') ||
          label.toLowerCase().includes('expense') ||
          label.toLowerCase().includes('gop') ||
          label.toLowerCase().includes('profit') ||
          label.toLowerCase().includes('ebitda') ||
          label.toLowerCase().includes('total')) {
        
        keyRows.push({ row: rowNum, label });
        console.log(`Row ${rowNum}: ${label}`);
      }
    });

    console.log();

    // Get formulas for October column (N) for key rows
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 CHECKING FORMULAS IN COLUMN N (OCTOBER):\n');

    const formulaRanges = keyRows.map(kr => `'${SHEET_NAME}'!N${kr.row}`);
    
    const formulasResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: formulaRanges,
      valueRenderOption: 'FORMULA',
    });

    const valuesResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: formulaRanges,
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    keyRows.forEach((kr, index) => {
      const formula = formulasResponse.data.valueRanges?.[index]?.values?.[0]?.[0] || '';
      const value = valuesResponse.data.valueRanges?.[index]?.values?.[0]?.[0];
      
      console.log(`Row ${kr.row}: ${kr.label}`);
      console.log(`   Cell N${kr.row}:`);
      
      if (formula && formula.toString().startsWith('=')) {
        console.log(`   Formula: ${formula}`);
      } else if (formula) {
        console.log(`   Value: ${formula}`);
      } else {
        console.log(`   (empty)`);
      }
      
      if (value !== undefined && value !== null && value !== formula) {
        console.log(`   Result: ${typeof value === 'number' ? value.toLocaleString() : value}`);
      }
      
      console.log();
    });

    // Check specific sections
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 SECTION ANALYSIS:\n');

    // Revenue section (rows 7-11)
    console.log('💰 REVENUE SECTION (Rows 7-11):');
    const revenueResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A7:N11`,
    });
    
    revenueResponse.data.values?.forEach((row, index) => {
      const rowNum = 7 + index;
      const label = row[0] || '';
      const octValue = row[13] || ''; // Column N
      console.log(`   Row ${rowNum}: ${label} = ${octValue}`);
    });
    console.log();

    // Property/Person section (rows 14-20)
    console.log('🏠 PROPERTY/PERSON SECTION (Rows 14-20):');
    const propertyResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A14:N20`,
    });
    
    propertyResponse.data.values?.forEach((row, index) => {
      const rowNum = 14 + index;
      const label = row[0] || '';
      const octValue = row[13] || ''; // Column N
      console.log(`   Row ${rowNum}: ${label} = ${octValue}`);
    });
    console.log();

    // Overhead section (rows 29-52)
    console.log('💼 OVERHEAD EXPENSES SECTION (Rows 29-52):');
    const overheadResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A29:N52`,
    });
    
    overheadResponse.data.values?.forEach((row, index) => {
      const rowNum = 29 + index;
      const label = row[0] || '';
      const octValue = row[13] || ''; // Column N
      
      if (label.toLowerCase().includes('total') || 
          label.toLowerCase().includes('exp -') ||
          octValue !== '' && octValue !== 0) {
        console.log(`   Row ${rowNum}: ${label} = ${octValue}`);
      }
    });
    console.log();

    // GOP and EBITDA section (rows 46-50)
    console.log('📈 GOP & EBITDA SECTION (Rows 46-50):');
    const gopResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A46:N50`,
    });
    
    gopResponse.data.values?.forEach((row, index) => {
      const rowNum = 46 + index;
      const label = row[0] || '';
      const octValue = row[13] || ''; // Column N
      console.log(`   Row ${rowNum}: ${label} = ${octValue}`);
    });
    console.log();

    console.log('═══════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

inspectSheet();

