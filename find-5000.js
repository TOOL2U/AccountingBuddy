/**
 * Find where the ฿5,000 is actually stored
 */

const { google } = require('googleapis');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function findData() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, 'accounting-buddy-476114-82555a53603b.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    console.log('🔍 Searching for the ฿5,000 overhead expense data...\n');

    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });

    const sheetNames = spreadsheet.data.sheets?.map(s => s.properties?.title) || [];

    for (const sheetName of sheetNames) {
      console.log(`\n📄 Checking sheet: "${sheetName}"`);
      
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: `'${sheetName}'!A:Z`
        });

        const data = response.data.values || [];
        
        // Search for "EXP - HR - Employees Salaries"
        data.forEach((row, i) => {
          if (row[0] && row[0].toString().includes('EXP - HR - Employees Salaries')) {
            console.log(`   ✓ Found at row ${i + 1}`);
            console.log(`   Row data:`, row.slice(0, 20));
          }
        });
      } catch (error) {
        console.log(`   ⚠️ Could not read: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

findData();
