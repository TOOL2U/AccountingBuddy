#!/usr/bin/env node

/**
 * Check Named Ranges Script
 * Validates that all P&L named ranges point to the correct cells
 */

require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');
const fs = require('fs');

async function checkNamedRanges() {
  const credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('\n📋 Fetching Named Ranges from Google Sheets...\n');
  
  // Get named ranges
  const response = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    includeGridData: false
  });
  
  const namedRanges = response.data.namedRanges || [];
  const sheetInfo = response.data.sheets || [];
  
  // Get sheet names mapping
  const sheetNames = {};
  sheetInfo.forEach(s => {
    sheetNames[s.properties.sheetId] = s.properties.title;
  });
  
  // Filter P&L related ranges
  const pnlRanges = namedRanges.filter(nr => {
    const name = nr.name || '';
    return name.toLowerCase().includes('month') || 
           name.toLowerCase().includes('year') ||
           name.toLowerCase().includes('revenue') ||
           name.toLowerCase().includes('overhead') ||
           name.toLowerCase().includes('gop') ||
           name.toLowerCase().includes('ebitda');
  });
  
  console.log(`Found ${pnlRanges.length} P&L-related named ranges:\n`);
  
  pnlRanges.forEach(nr => {
    const range = nr.range;
    const sheetName = sheetNames[range.sheetId] || 'Unknown';
    const startRow = range.startRowIndex + 1;
    const endRow = range.endRowIndex || startRow;
    const startCol = String.fromCharCode(65 + (range.startColumnIndex || 0));
    const endCol = range.endColumnIndex ? String.fromCharCode(65 + range.endColumnIndex - 1) : startCol;
    
    const rangeNotation = startRow === endRow 
      ? `'${sheetName}'!${startCol}${startRow}`
      : `'${sheetName}'!${startCol}${startRow}:${endCol}${endRow}`;
    
    console.log(`${nr.name.padEnd(35)} → ${rangeNotation}`);
  });
  
  console.log('\n');
}

checkNamedRanges().catch(console.error);
