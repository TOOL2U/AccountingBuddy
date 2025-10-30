/**
 * Sync dropdown values using Google Sheets API
 * This fetches the latest validation ranges directly from your Google Sheet
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

async function syncFromGoogleSheets() {
  try {
    console.log('🔍 Connecting to Google Sheets API...');
    
    // Setup authentication
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!credentialsPath || !fs.existsSync(credentialsPath)) {
      throw new Error('Google credentials not found. Check GOOGLE_APPLICATION_CREDENTIALS path.');
    }
    
    if (!spreadsheetId) {
      throw new Error('Google Sheet ID not found. Check GOOGLE_SHEET_ID environment variable.');
    }
    
    console.log('✅ Credentials found');
    console.log('✅ Sheet ID:', spreadsheetId);
    
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('🔗 Connected to Google Sheets API');
    
    // Get validation rules to find the dropdown ranges
    console.log('📋 Fetching validation rules...');
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });
    
    console.log('✅ Got spreadsheet metadata');
    
    // Find the "Data" sheet which typically contains validation ranges
    const dataSheet = response.data.sheets?.find(sheet => 
      sheet.properties?.title?.toLowerCase().includes('data')
    );
    
    if (!dataSheet) {
      console.log('⚠️ Data sheet not found. Looking for validation ranges in all sheets...');
    }
    
    // Get data from known validation ranges based on your current config
    const ranges = [
      'Data!A4:A50',  // Type of Operation (expanded range to catch new ones)
      'Data!A38:A43', // Properties
      'Data!A71:A73'  // Type of Payment
    ];
    
    console.log('📊 Fetching data from ranges:', ranges);
    
    const batchResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: ranges,
    });
    
    const valueRanges = batchResponse.data.valueRanges || [];
    
    // Headers to filter out (these are section headers in the sheet, not actual values)
    const headersToFilter = ['FIXED COSTS', 'Fixed Costs', 'EXPENSES', 'REVENUES', 'PROPERTY', 'TYPE OF PAYMENT'];
    
    // Parse the results and filter out headers
    const newTypeOfOperation = valueRanges[0]?.values?.flat()
      .filter(v => v && v.trim())
      .filter(v => !headersToFilter.includes(v.trim())) || [];
    
    const newProperties = valueRanges[1]?.values?.flat()
      .filter(v => v && v.trim())
      .filter(v => !headersToFilter.includes(v.trim())) || [];
    
    const newTypeOfPayment = valueRanges[2]?.values?.flat()
      .filter(v => v && v.trim())
      .filter(v => !headersToFilter.includes(v.trim())) || [];
    
    console.log('\\n📊 Fetched from Google Sheets:');
    console.log(`   Properties: ${newProperties.length} items`);
    console.log(`   Type of Operation: ${newTypeOfOperation.length} items`);
    console.log(`   Type of Payment: ${newTypeOfPayment.length} items`);
    
    // Read current config files
    const optionsPath = path.join(__dirname, 'config/options.json');
    const liveDropdownsPath = path.join(__dirname, 'config/live-dropdowns.json');
    
    const currentOptions = JSON.parse(fs.readFileSync(optionsPath, 'utf8'));
    const currentLiveDropdowns = JSON.parse(fs.readFileSync(liveDropdownsPath, 'utf8'));
    
    console.log('\\n🔍 Comparing with current config:');
    console.log(`   Current Type of Operation: ${currentOptions.typeOfOperation.length} items`);
    
    // Find new operations
    const newOperations = newTypeOfOperation.filter(op => 
      !currentOptions.typeOfOperation.includes(op)
    );
    
    if (newOperations.length > 0) {
      console.log('\\n🆕 NEW OPERATIONS FOUND:');
      newOperations.forEach((op, i) => {
        console.log(`   ${i + 1}. ${op}`);
      });
      
      // Update configs
      currentOptions.typeOfOperation = newTypeOfOperation;
      currentOptions.properties = newProperties;
      currentOptions.typeOfPayment = newTypeOfPayment;
      
      currentLiveDropdowns.typeOfOperation = newTypeOfOperation;
      currentLiveDropdowns.property = newProperties;
      currentLiveDropdowns.typeOfPayment = newTypeOfPayment;
      currentLiveDropdowns.fetchedAt = new Date().toISOString();
      currentLiveDropdowns.source = 'google_sheets_api';
      
      // Write updated files
      fs.writeFileSync(optionsPath, JSON.stringify(currentOptions, null, 2));
      fs.writeFileSync(liveDropdownsPath, JSON.stringify(currentLiveDropdowns, null, 2));
      
      console.log('\\n✅ UPDATED CONFIG FILES:');
      console.log('   ✅ config/options.json');
      console.log('   ✅ config/live-dropdowns.json');
      
      console.log('\\n🎉 Sync complete! New operations are now available in your app.');
      
    } else {
      console.log('\\n✅ No new operations found. Config is up to date.');
    }
    
    console.log('\\n📋 All Type of Operations:');
    newTypeOfOperation.forEach((op, i) => {
      const isNew = newOperations.includes(op);
      console.log(`   ${i + 1}. ${op} ${isNew ? '🆕' : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error syncing from Google Sheets:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    if (error.response?.data) {
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the sync
syncFromGoogleSheets();