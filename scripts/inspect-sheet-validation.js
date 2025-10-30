const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function inspectValidationRules() {
  try {
    console.log('🔍 Inspecting Google Sheet for validation rules...\n');

    // Setup authentication using service account file
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
    
    // We need to get the spreadsheet ID from Shaun
    // For now, let's try to extract it from the CSV file path or ask
    console.log('⚠️  GOOGLE_SHEET_ID not found in .env.local');
    console.log('📋 Please provide the Google Sheet ID from the URL:');
    console.log('   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit\n');
    
    // Check if we can find it in any config files
    const csvPath = path.join(__dirname, '../docs/Accounting Buddy P&L 2025 - Accounting .csv');
    if (fs.existsSync(csvPath)) {
      console.log('✅ Found CSV reference file at:', csvPath);
      console.log('   This confirms the sheet name: "Accounting Buddy P&L 2025"\n');
    }
    
    console.log('🔧 To complete this inspection, please:');
    console.log('   1. Open your Google Sheet');
    console.log('   2. Copy the SPREADSHEET_ID from the URL');
    console.log('   3. Add to .env.local: GOOGLE_SHEET_ID=your_spreadsheet_id');
    console.log('   4. Run this script again\n');
    
    console.log('📧 Service Account Email (share your sheet with this):');
    console.log(`   ${credentials.client_email}\n`);
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

async function inspectWithSheetId(spreadsheetId) {
  try {
    console.log('🔍 Inspecting Google Sheet for validation rules...\n');

    // Setup authentication
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    console.log(`📊 Sheet ID: ${spreadsheetId}`);
    console.log(`📄 Sheet Name: "Accounting Buddy P&L 2025"\n`);

    // Fetch sheet metadata including validation rules
    // We'll check rows 1-20 to find where validation rules are set
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: ['Accounting Buddy P&L 2025!E1:G20'],
      fields: 'sheets(properties(title),data(startRow,rowData(values(dataValidation,userEnteredValue,formattedValue))))',
    });

    const sheetData = response.data.sheets[0];
    const rowData = sheetData.data[0].rowData;

    console.log('📋 Scanning columns E, F, G (rows 1-20) for validation rules...\n');

    let foundValidation = false;
    let validationRow = null;
    let validationData = {
      property: [],
      typeOfOperation: [],
      typeOfPayment: []
    };

    // Check each row for validation rules
    rowData.forEach((row, index) => {
      const actualRow = index + 1; // 1-indexed
      const values = row.values || [];

      const colE = values[0] || {}; // Property
      const colF = values[1] || {}; // Type of Operation
      const colG = values[2] || {}; // Type of Payment

      // Check if any column has validation
      const hasValidation = colE.dataValidation || colF.dataValidation || colG.dataValidation;

      if (hasValidation) {
        foundValidation = true;
        validationRow = actualRow;

        console.log(`✅ Found validation rules in Row ${actualRow}:\n`);
        
        // Column E - Property
        if (colE.dataValidation) {
          const result = extractValidationOptions(colE.dataValidation);
          validationData.property = result;
          console.log(`   📍 Column E (Property):`);
          console.log(`      Type: ${result.type}`);
          if (result.options && result.options.length > 0) {
            console.log(`      Options (${result.options.length}): ${result.options.join(', ')}`);
          } else if (result.range) {
            console.log(`      Range: ${result.range}`);
          }
          console.log('');
        } else {
          console.log(`   ⚠️  Column E (Property): No validation found`);
          console.log('');
        }
        
        // Column F - Type of Operation
        if (colF.dataValidation) {
          const result = extractValidationOptions(colF.dataValidation);
          validationData.typeOfOperation = result;
          console.log(`   📍 Column F (Type of Operation):`);
          console.log(`      Type: ${result.type}`);
          if (result.options && result.options.length > 0) {
            console.log(`      Options (${result.options.length}):`);
            result.options.forEach(opt => console.log(`      - ${opt}`));
          } else if (result.range) {
            console.log(`      Range: ${result.range}`);
          }
          console.log('');
        } else {
          console.log(`   ⚠️  Column F (Type of Operation): No validation found`);
          console.log('');
        }
        
        // Column G - Type of Payment
        if (colG.dataValidation) {
          const result = extractValidationOptions(colG.dataValidation);
          validationData.typeOfPayment = result;
          console.log(`   📍 Column G (Type of Payment):`);
          console.log(`      Type: ${result.type}`);
          if (result.options && result.options.length > 0) {
            console.log(`      Options (${result.options.length}): ${result.options.join(', ')}`);
          } else if (result.range) {
            console.log(`      Range: ${result.range}`);
          }
          console.log('');
        } else {
          console.log(`   ⚠️  Column G (Type of Payment): No validation found`);
          console.log('');
        }

        console.log('─'.repeat(60));
        console.log('');
      }
    });

    if (!foundValidation) {
      console.log('❌ No validation rules found in rows 1-20 of columns E, F, G\n');
      console.log('⚠️  Possible reasons:');
      console.log('   1. Validation rules are set on a different row (>20)');
      console.log('   2. Validation is range-based (e.g., references another sheet)');
      console.log('   3. Service account lacks permission to read validation rules');
      console.log('\n💡 Next steps:');
      console.log('   - Ask Shaun which row has the dropdowns');
      console.log('   - Or use data-driven extraction instead (scan actual values)\n');
    } else {
      console.log('✅ Inspection complete!\n');
      console.log('📊 Summary:');
      console.log(`   Validation Row: ${validationRow}`);
      console.log(`   Property: ${validationData.property.type} - ${validationData.property.options?.length || 0} options`);
      console.log(`   Type of Operation: ${validationData.typeOfOperation.type} - ${validationData.typeOfOperation.options?.length || 0} options`);
      console.log(`   Type of Payment: ${validationData.typeOfPayment.type} - ${validationData.typeOfPayment.options?.length || 0} options`);
      console.log('');
      
      // Save to file for reference
      const outputPath = path.join(__dirname, '../validation-rules.json');
      fs.writeFileSync(
        outputPath,
        JSON.stringify({
          validationRow,
          options: validationData,
          inspectedAt: new Date().toISOString(),
        }, null, 2)
      );
      
      console.log('💾 Validation data saved to: validation-rules.json');
      console.log('\n🚀 Ready to implement Apps Script dropdown fetcher!');
    }

  } catch (error) {
    console.error('\n❌ Error inspecting sheet:', error.message);
    
    if (error.code === 404) {
      console.error('\n⚠️  Sheet not found. Please check:');
      console.error('   1. GOOGLE_SHEET_ID in .env.local is correct');
      console.error('   2. Service account has viewer access to the sheet');
      console.error('   3. Sheet name is exactly "Accounting Buddy P&L 2025"');
    } else if (error.code === 403) {
      console.error('\n⚠️  Permission denied. Please check:');
      console.error('   1. Service account email has been shared with the sheet');
      console.error('   2. Service account has at least "Viewer" role');
      console.error('   3. Service account credentials are valid');
    } else {
      console.error('\n⚠️  Unexpected error. Full details:');
      console.error(error);
    }
    
    process.exit(1);
  }
}

/**
 * Extract options from a validation rule object
 */
function extractValidationOptions(validation) {
  if (!validation || !validation.condition) return { type: 'none', options: [] };

  const condition = validation.condition;

  // Type: ONE_OF_LIST (dropdown with explicit values)
  if (condition.type === 'ONE_OF_LIST' && condition.values) {
    return {
      type: 'list',
      options: condition.values
        .map(v => v.userEnteredValue || '')
        .filter(Boolean)
        .map(v => String(v).trim())
    };
  }

  // Type: ONE_OF_RANGE (dropdown based on cell range)
  if (condition.type === 'ONE_OF_RANGE' && condition.values) {
    const rangeValue = condition.values[0];
    return {
      type: 'range',
      range: rangeValue.userEnteredValue || 'Unknown range',
      options: []
    };
  }

  // Type: CUSTOM_FORMULA
  if (condition.type === 'CUSTOM_FORMULA') {
    return { type: 'formula', options: [] };
  }

  return { type: 'unknown', options: [] };
}

/**
 * Fetch values from a range reference
 */
async function fetchRangeValues(sheets, spreadsheetId, range) {
  try {
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

// Main execution
const spreadsheetId = process.env.GOOGLE_SHEET_ID;

if (!spreadsheetId) {
  inspectValidationRules();
} else {
  inspectWithSheetId(spreadsheetId);
}

