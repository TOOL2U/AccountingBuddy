/**
 * Simple diagnostic - just read what's actually in the cells
 */

const { google } = require('googleapis');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function diagnose() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'accounting-buddy-476114-82555a53603b.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('Reading cells...\n');
  
  // Read a larger range to see what's there
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "'P&L (DO NOT EDIT)'!A29:O55"
  });
  
  const values = response.data.values || [];
  
  console.log('Data found:');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  values.forEach((row, i) => {
    const rowNum = 29 + i;
    const colA = row[0] || '';
    const colN = row[13] || '';
    
    if (colA || colN) {
      console.log(`Row ${rowNum}:`);
      console.log(`  A: ${colA}`);
      console.log(`  N: ${colN}`);
      console.log('');
    }
  });
}

diagnose().catch(console.error);
