#!/usr/bin/env node

/**
 * Validate P&L Structure
 * Checks actual row positions of key metrics in the P&L sheet
 */

require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');
const fs = require('fs');

async function validatePnLStructure() {
  const credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('\n🔍 Scanning P&L Sheet Structure...\n');
  
  // Get column A to find all labels
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "'P&L (DO NOT EDIT)'!A1:A100",
  });
  
  const values = response.data.values || [];
  
  console.log('Key Metrics Row Numbers:\n');
  
  // Find specific rows
  const metricsToFind = [
    'TOTAL REVENUE',
    'PROPERTY OR PERSON',
    'TOTAL PROPERTY OR PERSON EXPENSE',
    'TOTAL OVERHEAD',
    'GOP',
    'EBITDA',
    'EBITDA %',
    'EBITDA MARGIN'
  ];
  
  values.forEach((row, index) => {
    const cellValue = (row[0] || '').trim().toUpperCase();
    
    metricsToFind.forEach(metric => {
      if (cellValue.includes(metric)) {
        const rowNum = index + 1;
        console.log(`Row ${rowNum.toString().padStart(3)}: ${row[0]}`);
      }
    });
  });
  
  console.log('\n📊 Property/Person Section:\n');
  let inPropertySection = false;
  let propertyStart = null;
  let propertyEnd = null;
  
  values.forEach((row, index) => {
    const cellValue = (row[0] || '').trim();
    
    if (cellValue.toUpperCase().includes('PROPERTY OR PERSON') && !cellValue.toUpperCase().includes('TOTAL')) {
      inPropertySection = true;
      console.log(`Row ${(index + 1).toString().padStart(3)}: ${cellValue} (HEADER)`);
      return;
    }
    
    if (inPropertySection) {
      if (cellValue.toUpperCase().includes('TOTAL PROPERTY')) {
        console.log(`Row ${(index + 1).toString().padStart(3)}: ${cellValue} (END OF SECTION)`);
        inPropertySection = false;
        propertyEnd = index;
      } else if (cellValue && cellValue.trim() !== '') {
        if (propertyStart === null) propertyStart = index + 1;
        console.log(`Row ${(index + 1).toString().padStart(3)}: ${cellValue}`);
        propertyEnd = index + 1;
      }
    }
  });
  
  console.log(`\n✅ Property/Person Data Range: A${propertyStart}:A${propertyEnd}\n`);
  
  console.log('\n📊 Overhead Expenses Section:\n');
  let overheadStart = null;
  let overheadEnd = null;
  
  values.forEach((row, index) => {
    const cellValue = (row[0] || '').trim();
    
    if (cellValue.startsWith('EXP -')) {
      if (overheadStart === null) overheadStart = index + 1;
      overheadEnd = index + 1;
      console.log(`Row ${(index + 1).toString().padStart(3)}: ${cellValue}`);
    }
  });
  
  console.log(`\n✅ Overhead Expenses Range: A${overheadStart}:A${overheadEnd}\n`);
  
  // Now check what the named ranges are pointing to
  console.log('\n🏷️  Checking Named Ranges vs Actual Data:\n');
  
  const namedRangesResponse = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    includeGridData: false
  });
  
  const namedRanges = namedRangesResponse.data.namedRanges || [];
  const sheetInfo = namedRangesResponse.data.sheets || [];
  
  const sheetNames = {};
  sheetInfo.forEach(s => {
    sheetNames[s.properties.sheetId] = s.properties.title;
  });
  
  const pnlRanges = namedRanges.filter(nr => {
    const name = nr.name || '';
    return name.toLowerCase().includes('ebitda') || 
           name.toLowerCase().includes('gop') ||
           name.toLowerCase().includes('revenue') ||
           name.toLowerCase().includes('overhead');
  });
  
  pnlRanges.forEach(nr => {
    const range = nr.range;
    const rowNum = range.startRowIndex + 1;
    const col = String.fromCharCode(65 + (range.startColumnIndex || 0));
    
    console.log(`${nr.name.padEnd(35)} → ${col}${rowNum}`);
  });
  
  // Read actual values at those cells
  console.log('\n📖 Reading Actual Cell Values:\n');
  
  const cellsToCheck = [
    { cell: 'A56', label: 'Row 56 Label (expected: GOP)' },
    { cell: 'A57', label: 'Row 57 Label (expected: EBITDA Margin)' },
    { cell: 'A63', label: 'Row 63 Label (what you said is EBITDA Margin)' },
    { cell: 'Q56', label: 'Q56 Value (Year GOP)' },
    { cell: 'Q57', label: 'Q57 Value (Year EBITDA Margin - named range)' },
    { cell: 'Q63', label: 'Q63 Value (what you said is real EBITDA)' }
  ];
  
  for (const item of cellsToCheck) {
    const cellResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `'P&L (DO NOT EDIT)'!${item.cell}`,
    });
    
    const value = cellResponse.data.values?.[0]?.[0] || '(empty)';
    console.log(`${item.cell.padEnd(6)} - ${item.label.padEnd(50)} = "${value}"`);
  }
  
  console.log('\n');
}

validatePnLStructure().catch(console.error);
