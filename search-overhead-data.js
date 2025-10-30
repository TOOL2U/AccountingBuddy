/**
 * List all sheets and search for overhead expenses data
 */

const { google } = require('googleapis');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'accounting-buddy-476114-82555a53603b.json');

async function searchSheets() {
  console.log('🔍 Searching for Overhead Expenses Data\n');

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get spreadsheet info
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    console.log(`📊 Spreadsheet: ${spreadsheet.data.properties?.title}\n`);
    console.log('📋 Available Sheets:');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const allSheets = spreadsheet.data.sheets || [];
    
    for (const sheet of allSheets) {
      const sheetName = sheet.properties?.title || '';
      const sheetId = sheet.properties?.sheetId;
      console.log(`\n📄 Sheet: "${sheetName}" (ID: ${sheetId})`);
      
      // Try to find "EXP - HR - Employees Salaries" in column A
      try {
        const searchResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${sheetName}'!A:A`,
        });

        const columnA = searchResponse.data.values || [];
        
        // Search for the expense item
        const foundIndex = columnA.findIndex(row => 
          row[0] && row[0].toString().includes('EXP - HR - Employees Salaries')
        );

        if (foundIndex !== -1) {
          const rowNumber = foundIndex + 1;
          console.log(`   ✓ Found "EXP - HR - Employees Salaries" at row ${rowNumber}`);

          // Get the value in October column (need to find which column)
          const headerResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${sheetName}'!1:10`,
          });

          const headers = headerResponse.data.values || [];
          let octColumnIndex = -1;

          // Search for OCT in headers
          for (let i = 0; i < headers.length; i++) {
            const headerRow = headers[i] || [];
            const foundCol = headerRow.findIndex(h => 
              h && h.toString().toUpperCase().trim() === 'OCT'
            );
            if (foundCol !== -1) {
              octColumnIndex = foundCol;
              const colLetter = String.fromCharCode(65 + foundCol);
              console.log(`   ✓ Found OCT column: ${colLetter} (row ${i + 1})`);
              
              // Get the value
              const valueResponse = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `'${sheetName}'!${colLetter}${rowNumber}`,
              });

              const value = valueResponse.data.values?.[0]?.[0];
              console.log(`   ✓ Value at ${colLetter}${rowNumber}: ${value}`);
              
              break;
            }
          }

          if (octColumnIndex === -1) {
            console.log(`   ⚠️ Could not find OCT column in this sheet`);
          }
        }
      } catch (error) {
        console.log(`   ⚠️ Could not search this sheet: ${error.message}`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

searchSheets();
