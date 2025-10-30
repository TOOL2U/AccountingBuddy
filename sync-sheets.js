#!/usr/bin/env node

/**
 * Unified Google Sheets Sync Script
 * 
 * This script synchronizes all data from Google Sheets to the webapp:
 * - Dropdown options (Type of Operation, Properties, Type of Payment)
 * - AI keywords for all options
 * - P&L sheet structure (row numbers, named ranges)
 * - Apps Script configuration
 * 
 * Usage: node sync-sheets.js [--dry-run] [--verbose]
 * 
 * Options:
 *   --dry-run    Show what would change without making changes
 *   --verbose    Show detailed logs
 *   --force      Force update even if no changes detected
 */

require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Configuration
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || './accounting-buddy-476114-82555a53603b.json';
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose');
const FORCE = args.includes('--force');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Logging utilities
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function verbose(message) {
  if (VERBOSE) {
    console.log(`${colors.cyan}[VERBOSE] ${message}${colors.reset}`);
  }
}

function error(message) {
  console.error(`${colors.red}❌ ${message}${colors.reset}`);
}

function success(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function warning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function info(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

// ============================================================================
// Google Sheets API Setup
// ============================================================================

async function setupGoogleSheetsAPI() {
  verbose('Setting up Google Sheets API...');
  
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(`Credentials file not found: ${CREDENTIALS_PATH}`);
  }
  
  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SHEET_ID not found in environment variables');
  }
  
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  verbose('Google Sheets API ready');
  return sheets;
}

// ============================================================================
// Phase 1: Detect Changes in "Data" Sheet
// ============================================================================

async function scanDataSheet(sheets) {
  log('\n📊 Phase 1: Scanning "Data" sheet for dropdown options...', 'bright');

  // Fetch the entire Data sheet column A to properly identify sections
  verbose('Fetching Data sheet column A...');

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Data!A1:A100',
  });

  const allValues = response.data.values || [];

  // Find section boundaries by looking for headers
  let typeOfOperationStart = -1;
  let typeOfOperationEnd = -1;
  let propertiesStart = -1;
  let propertiesEnd = -1;
  let typeOfPaymentStart = -1;
  let typeOfPaymentEnd = -1;

  for (let i = 0; i < allValues.length; i++) {
    const value = allValues[i]?.[0]?.trim() || '';

    // Detect REVENUES section (start of Type of Operation)
    if (value === 'REVENUES' && typeOfOperationStart === -1) {
      typeOfOperationStart = i + 1; // Start after header
    }

    // Detect PROPERTY section (end of Type of Operation, start of Properties)
    if (value === 'PROPERTY') {
      if (typeOfOperationStart !== -1 && typeOfOperationEnd === -1) {
        typeOfOperationEnd = i - 1; // End before this header
      }
      propertiesStart = i + 1; // Start after header
    }

    // Detect TYPE OF PAYMENT section (end of Properties, start of Type of Payment)
    if (value === 'TYPE OF PAYMENT') {
      if (propertiesStart !== -1 && propertiesEnd === -1) {
        propertiesEnd = i - 1; // End before this header
      }
      typeOfPaymentStart = i + 1; // Start after header
    }

    // Detect MONTHS section (end of Type of Payment)
    if (value === 'MONTHS') {
      if (typeOfPaymentStart !== -1 && typeOfPaymentEnd === -1) {
        typeOfPaymentEnd = i - 1; // End before this header
      }
    }
  }

  verbose(`Type of Operation: rows ${typeOfOperationStart + 1} to ${typeOfOperationEnd + 1}`);
  verbose(`Properties: rows ${propertiesStart + 1} to ${propertiesEnd + 1}`);
  verbose(`Type of Payment: rows ${typeOfPaymentStart + 1} to ${typeOfPaymentEnd + 1}`);

  // Extract data from identified ranges
  const typeOfOperation = [];
  const properties = [];
  const typeOfPayment = [];

  // Headers to skip (section headers within the data)
  const headersToSkip = [
    'REVENUES', 'FIXED COSTS', 'EXPENSES', 'PROPERTY', 'TYPE OF PAYMENT', 'MONTHS',
    'Revenue', 'Fixed Costs', 'Expense', 'Expenses'
  ];

  // Extract Type of Operation
  for (let i = typeOfOperationStart; i <= typeOfOperationEnd; i++) {
    const value = allValues[i]?.[0]?.trim();
    if (value && !headersToSkip.includes(value) && !value.match(/^-+$/)) {
      typeOfOperation.push(value);
    }
  }

  // Extract Properties
  for (let i = propertiesStart; i <= propertiesEnd; i++) {
    const value = allValues[i]?.[0]?.trim();
    if (value && !headersToSkip.includes(value) && !value.match(/^-+$/)) {
      properties.push(value);
    }
  }

  // Extract Type of Payment
  for (let i = typeOfPaymentStart; i <= typeOfPaymentEnd; i++) {
    const value = allValues[i]?.[0]?.trim();
    if (value && !headersToSkip.includes(value) && !value.match(/^-+$/)) {
      typeOfPayment.push(value);
    }
  }

  info(`Found ${typeOfOperation.length} Type of Operation items`);
  info(`Found ${properties.length} Properties`);
  info(`Found ${typeOfPayment.length} Type of Payment items`);

  if (VERBOSE) {
    verbose('Type of Operation items:');
    typeOfOperation.forEach(item => verbose(`  - ${item}`));
    verbose('Properties:');
    properties.forEach(item => verbose(`  - ${item}`));
    verbose('Type of Payment items:');
    typeOfPayment.forEach(item => verbose(`  - ${item}`));
  }

  return {
    typeOfOperation,
    properties,
    typeOfPayment
  };
}

// ============================================================================
// Phase 2: Detect Changes in "P&L (DO NOT EDIT)" Sheet
// ============================================================================

async function scanPnLSheet(sheets) {
  log('\n📈 Phase 2: Scanning "P&L (DO NOT EDIT)" sheet structure...', 'bright');

  // Get column A data to find overhead expenses and property/person ranges
  verbose('Fetching P&L sheet column A...');

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "'P&L (DO NOT EDIT)'!A1:A100",
  });

  const allValues = response.data.values || [];

  // Find Property/Person range (rows between "PROPERTY OR PERSON" header and "TOTAL PROPERTY OR PERSON EXPENSE")
  let propertyPersonStart = null;
  let propertyPersonEnd = null;
  let foundPropertyHeader = false;

  // Find overhead expenses range (rows starting with "EXP -")
  let overheadStart = null;
  let overheadEnd = null;

  for (let i = 0; i < allValues.length; i++) {
    const cellValue = allValues[i]?.[0]?.trim() || '';

    // Detect Property/Person section
    if (cellValue.toUpperCase().includes('PROPERTY OR PERSON') && !cellValue.toUpperCase().includes('TOTAL')) {
      foundPropertyHeader = true;
      verbose(`Found Property/Person header at row ${i + 1}`);
      continue;
    }

    // If we found the header, start collecting property names
    if (foundPropertyHeader && cellValue && !cellValue.toUpperCase().includes('TOTAL')) {
      if (propertyPersonStart === null) {
        propertyPersonStart = i + 1;
      }
      propertyPersonEnd = i + 1;
    }

    // Stop collecting when we hit "TOTAL PROPERTY OR PERSON EXPENSE"
    if (foundPropertyHeader && cellValue.toUpperCase().includes('TOTAL PROPERTY OR PERSON')) {
      foundPropertyHeader = false;
      verbose(`Property/Person section ends at row ${i + 1}`);
    }

    // Detect overhead expenses (EXP -)
    if (cellValue.startsWith('EXP -')) {
      if (overheadStart === null) {
        overheadStart = i + 1; // Convert to 1-based row number
      }
      overheadEnd = i + 1; // Keep updating to find the last one
    }
  }

  verbose(`Property/Person detected: rows ${propertyPersonStart} to ${propertyPersonEnd}`);
  verbose(`Overhead expenses detected: rows ${overheadStart} to ${overheadEnd}`);

  if (VERBOSE && propertyPersonStart && propertyPersonEnd) {
    verbose('Property/Person items:');
    for (let i = propertyPersonStart - 1; i < propertyPersonEnd; i++) {
      const value = allValues[i]?.[0]?.trim();
      if (value) {
        verbose(`  Row ${i + 1}: ${value}`);
      }
    }
  }

  if (VERBOSE && overheadStart && overheadEnd) {
    verbose('Overhead expense categories:');
    for (let i = overheadStart - 1; i < overheadEnd; i++) {
      const value = allValues[i]?.[0]?.trim();
      if (value) {
        verbose(`  Row ${i + 1}: ${value}`);
      }
    }
  }

  info(`Property/Person: rows ${propertyPersonStart} to ${propertyPersonEnd} (${propertyPersonEnd - propertyPersonStart + 1} items)`);
  info(`Overhead expenses: rows ${overheadStart} to ${overheadEnd} (${overheadEnd - overheadStart + 1} categories)`);

  return {
    propertyPersonStart,
    propertyPersonEnd,
    propertyPersonCount: propertyPersonEnd - propertyPersonStart + 1,
    overheadStart,
    overheadEnd,
    overheadCount: overheadEnd - overheadStart + 1
  };
}

// ============================================================================
// Phase 3: Detect Named Ranges
// ============================================================================

async function scanNamedRanges(sheets) {
  log('\n🏷️  Phase 3: Scanning named ranges...', 'bright');
  
  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    includeGridData: false
  });
  
  const namedRanges = response.data.namedRanges || [];
  
  const pnlRelatedRanges = namedRanges.filter(nr => {
    const name = nr.name || '';
    return name.toLowerCase().includes('month') || 
           name.toLowerCase().includes('year') ||
           name.toLowerCase().includes('revenue') ||
           name.toLowerCase().includes('overhead') ||
           name.toLowerCase().includes('gop') ||
           name.toLowerCase().includes('ebitda');
  });
  
  const rangeMap = {};
  pnlRelatedRanges.forEach(nr => {
    const range = nr.range;
    const rowIndex = range.startRowIndex + 1; // Convert to 1-based
    rangeMap[nr.name] = {
      row: rowIndex,
      sheet: range.sheetId
    };
  });
  
  info(`Found ${pnlRelatedRanges.length} P&L-related named ranges`);
  
  if (VERBOSE) {
    Object.entries(rangeMap).forEach(([name, data]) => {
      verbose(`  ${name} → Row ${data.row}`);
    });
  }
  
  return rangeMap;
}

// ============================================================================
// Phase 4: Compare with Current Config
// ============================================================================

function compareWithCurrentConfig(fetchedData) {
  log('\n🔍 Phase 4: Comparing with current configuration...', 'bright');
  
  const optionsPath = path.join(__dirname, 'config/options.json');
  const liveDropdownsPath = path.join(__dirname, 'config/live-dropdowns.json');
  
  const currentOptions = JSON.parse(fs.readFileSync(optionsPath, 'utf8'));
  const currentLiveDropdowns = JSON.parse(fs.readFileSync(liveDropdownsPath, 'utf8'));
  
  const changes = {
    typeOfOperation: {
      added: [],
      removed: [],
      unchanged: []
    },
    properties: {
      added: [],
      removed: [],
      unchanged: []
    },
    typeOfPayment: {
      added: [],
      removed: [],
      unchanged: []
    }
  };
  
  // Compare Type of Operation
  const currentTypeOfOp = new Set(currentOptions.typeOfOperation);
  const fetchedTypeOfOp = new Set(fetchedData.typeOfOperation);
  
  fetchedData.typeOfOperation.forEach(item => {
    if (!currentTypeOfOp.has(item)) {
      changes.typeOfOperation.added.push(item);
    } else {
      changes.typeOfOperation.unchanged.push(item);
    }
  });
  
  currentOptions.typeOfOperation.forEach(item => {
    if (!fetchedTypeOfOp.has(item)) {
      changes.typeOfOperation.removed.push(item);
    }
  });
  
  // Compare Properties
  const currentProps = new Set(currentOptions.properties);
  const fetchedProps = new Set(fetchedData.properties);
  
  fetchedData.properties.forEach(item => {
    if (!currentProps.has(item)) {
      changes.properties.added.push(item);
    } else {
      changes.properties.unchanged.push(item);
    }
  });
  
  currentOptions.properties.forEach(item => {
    if (!fetchedProps.has(item)) {
      changes.properties.removed.push(item);
    }
  });
  
  // Compare Type of Payment
  const currentPayment = new Set(currentOptions.typeOfPayment);
  const fetchedPayment = new Set(fetchedData.typeOfPayment);
  
  fetchedData.typeOfPayment.forEach(item => {
    if (!currentPayment.has(item)) {
      changes.typeOfPayment.added.push(item);
    } else {
      changes.typeOfPayment.unchanged.push(item);
    }
  });

  currentOptions.typeOfPayment.forEach(item => {
    if (!fetchedPayment.has(item)) {
      changes.typeOfPayment.removed.push(item);
    }
  });

  // Print summary
  const totalChanges =
    changes.typeOfOperation.added.length + changes.typeOfOperation.removed.length +
    changes.properties.added.length + changes.properties.removed.length +
    changes.typeOfPayment.added.length + changes.typeOfPayment.removed.length;

  if (totalChanges === 0) {
    success('No changes detected in dropdown options');
  } else {
    warning(`Detected ${totalChanges} changes in dropdown options`);

    if (changes.typeOfOperation.added.length > 0) {
      info(`Type of Operation - Added: ${changes.typeOfOperation.added.join(', ')}`);
    }
    if (changes.typeOfOperation.removed.length > 0) {
      warning(`Type of Operation - Removed: ${changes.typeOfOperation.removed.join(', ')}`);
    }

    if (changes.properties.added.length > 0) {
      info(`Properties - Added: ${changes.properties.added.join(', ')}`);
    }
    if (changes.properties.removed.length > 0) {
      warning(`Properties - Removed: ${changes.properties.removed.join(', ')}`);
    }

    if (changes.typeOfPayment.added.length > 0) {
      info(`Type of Payment - Added: ${changes.typeOfPayment.added.join(', ')}`);
    }
    if (changes.typeOfPayment.removed.length > 0) {
      warning(`Type of Payment - Removed: ${changes.typeOfPayment.removed.join(', ')}`);
    }
  }

  return changes;
}

// ============================================================================
// Phase 5: Generate AI Keywords for New Items
// ============================================================================

async function generateKeywordsForNewItems(changes) {
  log('\n🤖 Phase 5: Generating AI keywords for new items...', 'bright');

  const newItems = [
    ...changes.typeOfOperation.added,
    ...changes.properties.added,
    ...changes.typeOfPayment.added
  ];

  if (newItems.length === 0) {
    info('No new items to generate keywords for');
    return {};
  }

  if (!OPENAI_API_KEY) {
    warning('OPENAI_API_KEY not found - skipping keyword generation');
    warning('You will need to manually add keywords for new items');
    return {};
  }

  info(`Generating keywords for ${newItems.length} new items using GPT-4...`);

  const generatedKeywords = {};

  for (const item of newItems) {
    verbose(`Generating keywords for: ${item}`);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a keyword extraction expert. Generate relevant keywords for categorizing financial transactions.'
            },
            {
              role: 'user',
              content: `Generate 5-10 relevant keywords for this category: "${item}"\n\nReturn ONLY a JSON array of lowercase keywords, no explanation.\n\nExample: ["keyword1", "keyword2", "keyword3"]`
            }
          ],
          temperature: 0.3,
          max_tokens: 100
        })
      });

      if (!response.ok) {
        warning(`Failed to generate keywords for "${item}"`);
        continue;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '[]';

      try {
        const keywords = JSON.parse(content);
        generatedKeywords[item] = keywords;
        verbose(`  Generated ${keywords.length} keywords: ${keywords.join(', ')}`);
      } catch (e) {
        warning(`Failed to parse keywords for "${item}"`);
      }

      // Rate limiting - wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (err) {
      warning(`Error generating keywords for "${item}": ${err.message}`);
    }
  }

  success(`Generated keywords for ${Object.keys(generatedKeywords).length} items`);

  return generatedKeywords;
}

// ============================================================================
// Phase 6: Update Config Files
// ============================================================================

function updateConfigFiles(fetchedData, changes, generatedKeywords, pnlStructure) {
  log('\n💾 Phase 6: Updating configuration files...', 'bright');

  if (DRY_RUN) {
    warning('DRY RUN MODE - No files will be modified');
  }

  const optionsPath = path.join(__dirname, 'config/options.json');
  const liveDropdownsPath = path.join(__dirname, 'config/live-dropdowns.json');
  const enhancedKeywordsPath = path.join(__dirname, 'config/enhanced-keywords.json');

  // Read current files
  const currentOptions = JSON.parse(fs.readFileSync(optionsPath, 'utf8'));
  const currentLiveDropdowns = JSON.parse(fs.readFileSync(liveDropdownsPath, 'utf8'));
  const currentEnhancedKeywords = JSON.parse(fs.readFileSync(enhancedKeywordsPath, 'utf8'));

  // Update options.json
  const updatedOptions = {
    properties: fetchedData.properties,
    typeOfOperation: fetchedData.typeOfOperation,
    typeOfPayment: fetchedData.typeOfPayment,
    keywords: { ...currentOptions.keywords }
  };

  // Add keywords for new items
  Object.entries(generatedKeywords).forEach(([item, keywords]) => {
    // Determine which category this item belongs to
    if (fetchedData.typeOfOperation.includes(item)) {
      updatedOptions.keywords.typeOfOperation = updatedOptions.keywords.typeOfOperation || {};
      updatedOptions.keywords.typeOfOperation[item] = keywords;
    } else if (fetchedData.properties.includes(item)) {
      updatedOptions.keywords.properties = updatedOptions.keywords.properties || {};
      updatedOptions.keywords.properties[item] = keywords;
    } else if (fetchedData.typeOfPayment.includes(item)) {
      updatedOptions.keywords.typeOfPayment = updatedOptions.keywords.typeOfPayment || {};
      updatedOptions.keywords.typeOfPayment[item] = keywords;
    }
  });

  // Update live-dropdowns.json
  const updatedLiveDropdowns = {
    property: fetchedData.properties,
    typeOfOperation: fetchedData.typeOfOperation,
    typeOfPayment: fetchedData.typeOfPayment,
    extractedAt: new Date().toISOString(),
    source: 'google_sheets_api',
    ranges: currentLiveDropdowns.ranges || {
      property: 'Data!A38:A43',
      typeOfOperation: 'Data!A4:A35',
      typeOfPayment: 'Data!A46:A49'
    },
    filtered: currentLiveDropdowns.filtered || {
      headers: ['REVENUES', 'Fixed Costs', 'FIXED COSTS', 'EXPENSES', 'Property'],
      testValues: ['test', 'TEST', 'Test', 'demo', 'DEMO', 'Demo', 'sample', 'SAMPLE', 'Sample']
    },
    fetchedAt: new Date().toISOString()
  };

  // Update enhanced-keywords.json
  const updatedEnhancedKeywords = { ...currentEnhancedKeywords };

  Object.entries(generatedKeywords).forEach(([item, keywords]) => {
    if (fetchedData.typeOfOperation.includes(item)) {
      updatedEnhancedKeywords.typeOfOperation = updatedEnhancedKeywords.typeOfOperation || {};
      updatedEnhancedKeywords.typeOfOperation[item] = keywords;
    } else if (fetchedData.properties.includes(item)) {
      updatedEnhancedKeywords.properties = updatedEnhancedKeywords.properties || {};
      updatedEnhancedKeywords.properties[item] = keywords;
    }
  });

  // Write files
  if (!DRY_RUN) {
    fs.writeFileSync(optionsPath, JSON.stringify(updatedOptions, null, 2));
    success('Updated config/options.json');

    fs.writeFileSync(liveDropdownsPath, JSON.stringify(updatedLiveDropdowns, null, 2));
    success('Updated config/live-dropdowns.json');

    fs.writeFileSync(enhancedKeywordsPath, JSON.stringify(updatedEnhancedKeywords, null, 2));
    success('Updated config/enhanced-keywords.json');
  } else {
    info('Would update config/options.json');
    info('Would update config/live-dropdowns.json');
    info('Would update config/enhanced-keywords.json');
  }

  return {
    updatedOptions,
    updatedLiveDropdowns,
    updatedEnhancedKeywords
  };
}

// ============================================================================
// Phase 7: Update Apps Script
// ============================================================================

function updateAppsScript(pnlStructure, namedRanges) {
  log('\n📝 Phase 7: Updating Apps Script configuration...', 'bright');

  const appsScriptPath = path.join(__dirname, 'COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js');
  let appsScriptContent = fs.readFileSync(appsScriptPath, 'utf8');

  let modified = false;

  // Update Property/Person range if changed
  if (pnlStructure.propertyPersonStart && pnlStructure.propertyPersonEnd) {
    // Extract current Property/Person range from Apps Script
    // Looking for: const nameRange = sheet.getRange("A14:A19");
    const currentPropertyRangeMatch = appsScriptContent.match(/const nameRange = sheet\.getRange\("A(\d+):A(\d+)"\);/);

    if (currentPropertyRangeMatch) {
      const currentPropertyStart = parseInt(currentPropertyRangeMatch[1]);
      const currentPropertyEnd = parseInt(currentPropertyRangeMatch[2]);

      verbose(`Current Apps Script Property/Person: A${currentPropertyStart}:A${currentPropertyEnd}`);
      verbose(`Detected in P&L Property/Person: A${pnlStructure.propertyPersonStart}:A${pnlStructure.propertyPersonEnd}`);

      if (currentPropertyStart !== pnlStructure.propertyPersonStart || currentPropertyEnd !== pnlStructure.propertyPersonEnd) {
        info(`Updating Property/Person range: A${currentPropertyStart}:A${currentPropertyEnd} → A${pnlStructure.propertyPersonStart}:A${pnlStructure.propertyPersonEnd}`);

        // Update nameRange
        appsScriptContent = appsScriptContent.replace(
          /const nameRange = sheet\.getRange\("A\d+:A\d+"\);/,
          `const nameRange = sheet.getRange("A${pnlStructure.propertyPersonStart}:A${pnlStructure.propertyPersonEnd}");`
        );

        // Update valueRange (note: no spaces around + in the actual code)
        appsScriptContent = appsScriptContent.replace(
          /const valueRange = sheet\.getRange\(valueColumn \+ "\d+" \+ ":" \+ valueColumn \+ "\d+"\);/,
          `const valueRange = sheet.getRange(valueColumn + "${pnlStructure.propertyPersonStart}:" + valueColumn + "${pnlStructure.propertyPersonEnd}");`
        );

        // Update the comment
        appsScriptContent = appsScriptContent.replace(
          /\/\/ Property\/Person names are in rows \d+-\d+, column A/,
          `// Property/Person names are in rows ${pnlStructure.propertyPersonStart}-${pnlStructure.propertyPersonEnd}, column A`
        );

        appsScriptContent = appsScriptContent.replace(
          /\/\/ Property\/Person values are in rows \d+-\d+, column N \(month\) or Q \(year\)/,
          `// Property/Person values are in rows ${pnlStructure.propertyPersonStart}-${pnlStructure.propertyPersonEnd}, column N (month) or Q (year)`
        );

        modified = true;
      }
    }
  }

  // Update overhead expenses range if changed
  if (pnlStructure.overheadStart && pnlStructure.overheadEnd) {
    // Extract current values from Apps Script
    const currentStartRowMatch = appsScriptContent.match(/const startRow = (\d+);/);
    const currentEndRowMatch = appsScriptContent.match(/const endRow = (\d+);/);

    const currentStartRow = currentStartRowMatch ? parseInt(currentStartRowMatch[1]) : null;
    const currentEndRow = currentEndRowMatch ? parseInt(currentEndRowMatch[1]) : null;

    verbose(`Current Apps Script Overhead: startRow=${currentStartRow}, endRow=${currentEndRow}`);
    verbose(`Detected in P&L Overhead: startRow=${pnlStructure.overheadStart}, endRow=${pnlStructure.overheadEnd}`);

    // Update startRow if changed
    if (currentStartRow !== pnlStructure.overheadStart) {
      info(`Updating overhead expenses start row: ${currentStartRow} → ${pnlStructure.overheadStart}`);
      appsScriptContent = appsScriptContent.replace(
        /const startRow = \d+;/,
        `const startRow = ${pnlStructure.overheadStart};`
      );
      modified = true;
    }

    // Update endRow if changed
    if (currentEndRow !== pnlStructure.overheadEnd) {
      info(`Updating overhead expenses end row: ${currentEndRow} → ${pnlStructure.overheadEnd}`);
      appsScriptContent = appsScriptContent.replace(
        /const endRow = \d+;.*$/m,
        `const endRow = ${pnlStructure.overheadEnd};  // Updated from ${currentEndRow} to ${pnlStructure.overheadEnd}`
      );
      modified = true;
    }

    // Update the count comment
    if (modified) {
      const newCount = pnlStructure.overheadEnd - pnlStructure.overheadStart + 1;
      appsScriptContent = appsScriptContent.replace(
        /const numRows = endRow - startRow \+ 1; \/\/ \d+ rows/,
        `const numRows = endRow - startRow + 1; // ${newCount} rows`
      );
    }
  }

  // Update version number
  if (modified) {
    const versionMatch = appsScriptContent.match(/Version (\d+\.\d+)/);
    if (versionMatch) {
      const currentVersion = parseFloat(versionMatch[1]);
      const newVersion = (currentVersion + 0.1).toFixed(1);

      appsScriptContent = appsScriptContent.replace(
        /Version \d+\.\d+/,
        `Version ${newVersion}`
      );

      info(`Updated Apps Script version: ${currentVersion} → ${newVersion}`);
    }
  }

  if (modified) {
    if (!DRY_RUN) {
      // Create backup
      const backupPath = path.join(__dirname, `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.backup.${Date.now()}.js`);
      fs.writeFileSync(backupPath, fs.readFileSync(appsScriptPath, 'utf8'));
      info(`Created backup: ${path.basename(backupPath)}`);

      // Write updated file
      fs.writeFileSync(appsScriptPath, appsScriptContent);
      success('Updated COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js');

      warning('⚠️  IMPORTANT: You need to deploy the updated Apps Script to Google Sheets!');
      info('   1. Open Google Sheets → Extensions → Apps Script');
      info('   2. Copy the entire updated file');
      info('   3. Paste it into Apps Script editor');
      info('   4. Deploy → Manage deployments → Edit → New version');
    } else {
      info('Would update COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js');
      info('Would create backup file');
    }
  } else {
    success('Apps Script is up to date - no changes needed');
  }

  return modified;
}

// ============================================================================
// Phase 8: Generate Sync Report
// ============================================================================

function generateSyncReport(changes, pnlStructure, namedRanges, appsScriptModified) {
  log('\n📋 Phase 8: Generating sync report...', 'bright');

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      dropdownChanges:
        changes.typeOfOperation.added.length + changes.typeOfOperation.removed.length +
        changes.properties.added.length + changes.properties.removed.length +
        changes.typeOfPayment.added.length + changes.typeOfPayment.removed.length,
      appsScriptModified,
      dryRun: DRY_RUN
    },
    changes: {
      typeOfOperation: {
        added: changes.typeOfOperation.added,
        removed: changes.typeOfOperation.removed,
        total: changes.typeOfOperation.added.length + changes.typeOfOperation.unchanged.length
      },
      properties: {
        added: changes.properties.added,
        removed: changes.properties.removed,
        total: changes.properties.added.length + changes.properties.unchanged.length
      },
      typeOfPayment: {
        added: changes.typeOfPayment.added,
        removed: changes.typeOfPayment.removed,
        total: changes.typeOfPayment.added.length + changes.typeOfPayment.unchanged.length
      }
    },
    pnlStructure,
    namedRanges
  };

  const reportPath = path.join(__dirname, `sync-report-${Date.now()}.json`);

  if (!DRY_RUN) {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    success(`Sync report saved: ${path.basename(reportPath)}`);
  }

  return report;
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  try {
    log('\n' + '='.repeat(70), 'bright');
    log('  🔄 UNIFIED GOOGLE SHEETS SYNC SCRIPT', 'bright');
    log('='.repeat(70) + '\n', 'bright');

    if (DRY_RUN) {
      warning('🔍 DRY RUN MODE - No changes will be made');
    }

    if (VERBOSE) {
      info('📢 Verbose mode enabled');
    }

    // Setup Google Sheets API
    const sheets = await setupGoogleSheetsAPI();
    success('Connected to Google Sheets API');

    // Phase 1: Scan Data sheet
    const fetchedData = await scanDataSheet(sheets);

    // Phase 2: Scan P&L sheet
    const pnlStructure = await scanPnLSheet(sheets);

    // Phase 3: Scan named ranges
    const namedRanges = await scanNamedRanges(sheets);

    // Phase 4: Compare with current config
    const changes = compareWithCurrentConfig(fetchedData);

    // Check if we should proceed
    const totalChanges =
      changes.typeOfOperation.added.length + changes.typeOfOperation.removed.length +
      changes.properties.added.length + changes.properties.removed.length +
      changes.typeOfPayment.added.length + changes.typeOfPayment.removed.length;

    if (totalChanges === 0 && !FORCE) {
      log('\n' + '='.repeat(70), 'green');
      success('✨ Everything is already in sync! No changes needed.');
      log('='.repeat(70) + '\n', 'green');
      return;
    }

    // Phase 5: Generate keywords for new items
    const generatedKeywords = await generateKeywordsForNewItems(changes);

    // Phase 6: Update config files
    updateConfigFiles(fetchedData, changes, generatedKeywords, pnlStructure);

    // Phase 7: Update Apps Script
    const appsScriptModified = updateAppsScript(pnlStructure, namedRanges);

    // Phase 8: Generate report
    const report = generateSyncReport(changes, pnlStructure, namedRanges, appsScriptModified);

    // Final summary
    log('\n' + '='.repeat(70), 'green');
    log('  ✅ SYNC COMPLETE', 'green');
    log('='.repeat(70), 'green');

    if (!DRY_RUN) {
      success(`Updated ${totalChanges} dropdown options`);
      success(`Generated keywords for ${Object.keys(generatedKeywords).length} new items`);
      if (appsScriptModified) {
        warning('⚠️  Apps Script was modified - remember to deploy to Google Sheets!');
      }
    } else {
      info('Dry run complete - no files were modified');
      info('Run without --dry-run to apply changes');
    }

    log('');

  } catch (err) {
    error(`Fatal error: ${err.message}`);
    if (VERBOSE) {
      console.error(err);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };

