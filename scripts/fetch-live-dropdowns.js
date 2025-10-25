const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

/**
 * Fetch live dropdown options from Google Sheet validation rules
 * This reads the actual dropdown ranges configured in the sheet
 */
async function fetchLiveDropdowns() {
  try {
    console.log('🔍 Fetching live dropdown options from Google Sheet...\n');

    // Setup authentication
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (!credentialsPath || !fs.existsSync(credentialsPath)) {
      throw new Error('Service account credentials not found');
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

    // Step 1: Get sheet metadata to find validation rules
    console.log('📋 Step 1: Detecting validation rules...\n');
    
    const metadataResponse = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: ['Accounting Buddy P&L 2025!E6:G6'], // Check first data row
      fields: 'sheets(data(rowData(values(dataValidation))))',
    });

    const rowData = metadataResponse.data.sheets[0].data[0].rowData[0];
    const values = rowData.values || [];

    const colE = values[0] || {}; // Property
    const colF = values[1] || {}; // Type of Operation
    const colG = values[2] || {}; // Type of Payment

    // Step 2: Extract validation ranges
    const validationRanges = {
      property: extractValidationRange(colE.dataValidation),
      typeOfOperation: extractValidationRange(colF.dataValidation),
      typeOfPayment: extractValidationRange(colG.dataValidation),
    };

    console.log('✅ Validation ranges detected:\n');
    console.log(`   Property (Column E): ${validationRanges.property || 'Not found'}`);
    console.log(`   Type of Operation (Column F): ${validationRanges.typeOfOperation || 'Not found'}`);
    console.log(`   Type of Payment (Column G): ${validationRanges.typeOfPayment || 'Not found'}`);
    console.log('');

    // Step 3: Fetch actual values from validation ranges
    console.log('📋 Step 2: Fetching dropdown values from ranges...\n');

    const dropdownData = {
      property: [],
      typeOfOperation: [],
      typeOfPayment: [],
    };

    // Fetch Property options
    if (validationRanges.property) {
      dropdownData.property = await fetchRangeValues(sheets, spreadsheetId, validationRanges.property);
      console.log(`✅ Property: Found ${dropdownData.property.length} options`);
      dropdownData.property.forEach(opt => console.log(`   - ${opt}`));
      console.log('');
    }

    // Fetch Type of Operation options
    if (validationRanges.typeOfOperation) {
      dropdownData.typeOfOperation = await fetchRangeValues(sheets, spreadsheetId, validationRanges.typeOfOperation);
      console.log(`✅ Type of Operation: Found ${dropdownData.typeOfOperation.length} options`);
      dropdownData.typeOfOperation.forEach(opt => console.log(`   - ${opt}`));
      console.log('');
    }

    // Fetch Type of Payment options
    if (validationRanges.typeOfPayment) {
      dropdownData.typeOfPayment = await fetchRangeValues(sheets, spreadsheetId, validationRanges.typeOfPayment);
      console.log(`✅ Type of Payment: Found ${dropdownData.typeOfPayment.length} options`);
      dropdownData.typeOfPayment.forEach(opt => console.log(`   - ${opt}`));
      console.log('');
    }

    // Step 4: Save to file
    const outputData = {
      property: dropdownData.property,
      typeOfOperation: dropdownData.typeOfOperation,
      typeOfPayment: dropdownData.typeOfPayment,
      validationRanges,
      fetchedAt: new Date().toISOString(),
      source: 'live_validation_rules'
    };

    const outputPath = path.join(__dirname, '../config/live-dropdowns.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(outputData, null, 2)
    );

    console.log('─'.repeat(60));
    console.log('\n💾 Live dropdown data saved to: config/live-dropdowns.json');
    console.log('\n✅ SUCCESS! Dropdown options fetched from live Google Sheet\n');

    // Step 5: Update options.json
    console.log('📋 Step 3: Updating config/options.json...\n');
    
    const optionsPath = path.join(__dirname, '../config/options.json');
    let currentOptions = {};
    
    if (fs.existsSync(optionsPath)) {
      currentOptions = JSON.parse(fs.readFileSync(optionsPath, 'utf8'));
    }

    // Update with live data while preserving keywords
    const updatedOptions = {
      properties: dropdownData.property,
      typeOfOperation: dropdownData.typeOfOperation,
      typeOfPayment: dropdownData.typeOfPayment,
      keywords: currentOptions.keywords || {} // Preserve existing keywords
    };

    fs.writeFileSync(
      optionsPath,
      JSON.stringify(updatedOptions, null, 2)
    );

    console.log('✅ config/options.json updated with live dropdown values\n');
    console.log('─'.repeat(60));
    console.log('\n🎯 Summary:\n');
    console.log(`   Properties: ${dropdownData.property.length} options`);
    console.log(`   Type of Operation: ${dropdownData.typeOfOperation.length} options`);
    console.log(`   Type of Payment: ${dropdownData.typeOfPayment.length} options`);
    console.log('\n🚀 Ready for testing with live dropdown options!\n');

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
    } else {
      console.error('\n⚠️  Full error details:');
      console.error(error);
    }
    
    process.exit(1);
  }
}

/**
 * Extract validation range from a data validation object
 */
function extractValidationRange(validation) {
  if (!validation || !validation.condition) return null;

  const condition = validation.condition;

  // Type: ONE_OF_RANGE (dropdown based on cell range)
  if (condition.type === 'ONE_OF_RANGE' && condition.values && condition.values[0]) {
    let range = condition.values[0].userEnteredValue || null;

    // Clean up the range format (remove leading = sign)
    if (range && range.startsWith('=')) {
      range = range.substring(1);
    }

    return range;
  }

  // Type: ONE_OF_LIST (explicit list - extract values directly)
  if (condition.type === 'ONE_OF_LIST' && condition.values) {
    return 'EXPLICIT_LIST'; // We'll handle this differently
  }

  return null;
}

/**
 * Fetch values from a range reference
 */
async function fetchRangeValues(sheets, spreadsheetId, range) {
  try {
    // Handle explicit lists
    if (range === 'EXPLICIT_LIST') {
      return [];
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    
    const values = response.data.values || [];
    
    // Flatten and filter out empty values
    return values
      .flat()
      .filter(v => v && String(v).trim())
      .map(v => String(v).trim());
      
  } catch (error) {
    console.error(`   ❌ Failed to fetch range ${range}:`, error.message);
    return [];
  }
}

// Run the script
fetchLiveDropdowns();

