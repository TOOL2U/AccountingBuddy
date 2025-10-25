const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

/**
 * Simpler approach: Just fetch unique values from the actual data
 * This is more reliable than trying to parse validation rules
 */
async function fetchDropdownValues() {
  try {
    console.log('🔍 Fetching dropdown values from Google Sheet...\n');

    // Setup authentication
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (!credentialsPath) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS not found in .env.local');
    }

    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`Service account file not found at: ${credentialsPath}`);
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID not found in .env.local');
    }

    console.log(`📊 Sheet ID: ${spreadsheetId}`);
    console.log(`📄 Sheet Name: "Accounting Buddy P&L 2025"\n`);

    // Fetch all data from columns E, F, G (starting from row 6, which is the first data row)
    console.log('📋 Fetching data from columns E, F, G...\n');
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Accounting Buddy P&L 2025!E6:G1000', // Get plenty of rows
    });

    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      console.log('⚠️  No data found in the sheet');
      return;
    }

    console.log(`✅ Found ${rows.length} rows of data\n`);

    // Extract unique values for each column
    const propertySet = new Set();
    const operationSet = new Set();
    const paymentSet = new Set();

    rows.forEach(row => {
      const property = row[0]; // Column E
      const operation = row[1]; // Column F
      const payment = row[2]; // Column G

      if (property && String(property).trim()) {
        propertySet.add(String(property).trim());
      }
      if (operation && String(operation).trim()) {
        operationSet.add(String(operation).trim());
      }
      if (payment && String(payment).trim()) {
        paymentSet.add(String(payment).trim());
      }
    });

    // Convert to sorted arrays
    const propertyOptions = Array.from(propertySet).sort();
    const operationOptions = Array.from(operationSet).sort();
    const paymentOptions = Array.from(paymentSet).sort();

    // Display results
    console.log('✅ DROPDOWN VALUES EXTRACTED\n');
    console.log('─'.repeat(60));
    
    console.log('\n📍 Column E - Property:');
    console.log(`   Found ${propertyOptions.length} unique values:`);
    propertyOptions.forEach(opt => console.log(`   - ${opt}`));
    
    console.log('\n📍 Column F - Type of Operation:');
    console.log(`   Found ${operationOptions.length} unique values:`);
    operationOptions.forEach(opt => console.log(`   - ${opt}`));
    
    console.log('\n📍 Column G - Type of Payment:');
    console.log(`   Found ${paymentOptions.length} unique values:`);
    paymentOptions.forEach(opt => console.log(`   - ${opt}`));
    
    console.log('\n' + '─'.repeat(60));

    // Save to file
    const dropdownData = {
      property: propertyOptions,
      typeOfOperation: operationOptions,
      typeOfPayment: paymentOptions,
      extractedAt: new Date().toISOString(),
      source: 'actual_data',
      rowCount: rows.length
    };

    const outputPath = path.join(__dirname, '../dropdown-values.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(dropdownData, null, 2)
    );

    console.log('\n💾 Dropdown values saved to: dropdown-values.json');
    console.log('\n✅ SUCCESS! Ready to update options.json\n');

    // Show comparison with current options.json
    const optionsPath = path.join(__dirname, '../config/options.json');
    if (fs.existsSync(optionsPath)) {
      const currentOptions = JSON.parse(fs.readFileSync(optionsPath, 'utf8'));
      
      console.log('📊 Comparison with current options.json:\n');
      
      console.log('Property:');
      console.log(`   Current: ${currentOptions.properties.length} options`);
      console.log(`   Sheet:   ${propertyOptions.length} options`);
      console.log(`   Match:   ${JSON.stringify(currentOptions.properties) === JSON.stringify(propertyOptions) ? '✅' : '❌'}`);
      
      console.log('\nType of Operation:');
      console.log(`   Current: ${currentOptions.typeOfOperation.length} options`);
      console.log(`   Sheet:   ${operationOptions.length} options`);
      
      console.log('\nType of Payment:');
      console.log(`   Current: ${currentOptions.typeOfPayment.length} options`);
      console.log(`   Sheet:   ${paymentOptions.length} options`);
      console.log(`   Match:   ${JSON.stringify(currentOptions.typeOfPayment) === JSON.stringify(paymentOptions) ? '✅' : '❌'}`);
      
      console.log('');
    }

    console.log('🚀 Next step: Update config/options.json with these values\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 404) {
      console.error('\n⚠️  Sheet not found. Please check:');
      console.error('   1. GOOGLE_SHEET_ID in .env.local is correct');
      console.error('   2. Service account has viewer access to the sheet');
      console.error('   3. Sheet name is exactly "Accounting Buddy P&L 2025"');
    } else if (error.code === 403) {
      console.error('\n⚠️  Permission denied. Please check:');
      console.error('   1. Service account email has been shared with the sheet');
      console.error('   2. Service account has at least "Viewer" role');
    }
    
    process.exit(1);
  }
}

// Run the script
fetchDropdownValues();

