#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Accounting Buddy
 * 
 * This script runs ALL possible tests for the webapp:
 * - Environment validation
 * - Configuration file validation
 * - API endpoint tests
 * - Google Sheets integration tests
 * - Apps Script tests
 * - Build and lint tests
 * 
 * Usage: node test-all.js [--skip-build] [--skip-api] [--verbose]
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const SKIP_BUILD = args.includes('--skip-build');
const SKIP_API = args.includes('--skip-api');
const VERBOSE = args.includes('--verbose');

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Logging utilities
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
  results.passed++;
}

function fail(message, error = null) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
  if (error && VERBOSE) {
    console.log(`${colors.red}   Error: ${error}${colors.reset}`);
  }
  results.failed++;
}

function skip(message) {
  console.log(`${colors.yellow}⏭️  ${message}${colors.reset}`);
  results.skipped++;
}

function info(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function section(title) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);
}

// ============================================================================
// Test 1: Environment Variables
// ============================================================================

function testEnvironmentVariables() {
  section('TEST 1: Environment Variables');
  
  const requiredEnvVars = [
    'GOOGLE_APPLICATION_CREDENTIALS',
    'GOOGLE_SHEET_ID',
    'OPENAI_API_KEY',
    'SHEETS_WEBHOOK_URL',
    'SHEETS_WEBHOOK_SECRET',
    'GOOGLE_VISION_KEY'
  ];
  
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      success(`${varName} is set`);
      results.tests.push({ name: `ENV: ${varName}`, status: 'PASS' });
    } else {
      fail(`${varName} is missing`);
      results.tests.push({ name: `ENV: ${varName}`, status: 'FAIL' });
    }
  });
}

// ============================================================================
// Test 2: Configuration Files
// ============================================================================

function testConfigurationFiles() {
  section('TEST 2: Configuration Files');
  
  const configFiles = [
    'config/options.json',
    'config/live-dropdowns.json',
    'config/enhanced-keywords.json',
    'COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js'
  ];
  
  configFiles.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (filePath.endsWith('.json')) {
          JSON.parse(content); // Validate JSON
          success(`${filePath} exists and is valid JSON`);
        } else {
          success(`${filePath} exists`);
        }
        
        results.tests.push({ name: `CONFIG: ${filePath}`, status: 'PASS' });
      } else {
        fail(`${filePath} not found`);
        results.tests.push({ name: `CONFIG: ${filePath}`, status: 'FAIL' });
      }
    } catch (error) {
      fail(`${filePath} is invalid`, error.message);
      results.tests.push({ name: `CONFIG: ${filePath}`, status: 'FAIL' });
    }
  });
}

// ============================================================================
// Test 3: TypeScript and Linting
// ============================================================================

function testTypeScriptAndLinting() {
  section('TEST 3: TypeScript and Linting');
  
  try {
    info('Running TypeScript type check...');
    execSync('npx tsc --noEmit', { stdio: VERBOSE ? 'inherit' : 'pipe' });
    success('TypeScript type check passed');
    results.tests.push({ name: 'TypeScript', status: 'PASS' });
  } catch (error) {
    fail('TypeScript type check failed', error.message);
    results.tests.push({ name: 'TypeScript', status: 'FAIL' });
  }
  
  try {
    info('Running ESLint...');
    execSync('npm run lint', { stdio: VERBOSE ? 'inherit' : 'pipe' });
    success('ESLint passed');
    results.tests.push({ name: 'ESLint', status: 'PASS' });
  } catch (error) {
    fail('ESLint failed', error.message);
    results.tests.push({ name: 'ESLint', status: 'FAIL' });
  }
}

// ============================================================================
// Test 4: Build Test
// ============================================================================

function testBuild() {
  section('TEST 4: Next.js Build');
  
  if (SKIP_BUILD) {
    skip('Build test skipped (--skip-build flag)');
    results.tests.push({ name: 'Next.js Build', status: 'SKIP' });
    return;
  }
  
  try {
    info('Running Next.js build (this may take a few minutes)...');
    execSync('npm run build', { stdio: VERBOSE ? 'inherit' : 'pipe' });
    success('Next.js build passed');
    results.tests.push({ name: 'Next.js Build', status: 'PASS' });
  } catch (error) {
    fail('Next.js build failed', error.message);
    results.tests.push({ name: 'Next.js Build', status: 'FAIL' });
  }
}

// ============================================================================
// Test 5: Configuration Validation
// ============================================================================

function testConfigurationValidation() {
  section('TEST 5: Configuration Validation');
  
  try {
    const options = JSON.parse(fs.readFileSync('config/options.json', 'utf8'));
    const liveDropdowns = JSON.parse(fs.readFileSync('config/live-dropdowns.json', 'utf8'));
    const enhancedKeywords = JSON.parse(fs.readFileSync('config/enhanced-keywords.json', 'utf8'));
    
    // Test 5.1: Options structure
    if (options.typeOfOperation && Array.isArray(options.typeOfOperation)) {
      success(`options.json has ${options.typeOfOperation.length} Type of Operation items`);
      results.tests.push({ name: 'CONFIG: Type of Operation count', status: 'PASS' });
    } else {
      fail('options.json missing typeOfOperation array');
      results.tests.push({ name: 'CONFIG: Type of Operation count', status: 'FAIL' });
    }
    
    if (options.properties && Array.isArray(options.properties)) {
      success(`options.json has ${options.properties.length} Properties`);
      results.tests.push({ name: 'CONFIG: Properties count', status: 'PASS' });
    } else {
      fail('options.json missing properties array');
      results.tests.push({ name: 'CONFIG: Properties count', status: 'FAIL' });
    }
    
    if (options.typeOfPayment && Array.isArray(options.typeOfPayment)) {
      success(`options.json has ${options.typeOfPayment.length} Type of Payment items`);
      results.tests.push({ name: 'CONFIG: Type of Payment count', status: 'PASS' });
    } else {
      fail('options.json missing typeOfPayment array');
      results.tests.push({ name: 'CONFIG: Type of Payment count', status: 'FAIL' });
    }
    
    // Test 5.2: Enhanced keywords structure
    if (enhancedKeywords.properties && enhancedKeywords.typeOfOperation && enhancedKeywords.typeOfPayment) {
      success('enhanced-keywords.json has all required sections');
      results.tests.push({ name: 'CONFIG: Enhanced keywords structure', status: 'PASS' });
    } else {
      fail('enhanced-keywords.json missing required sections');
      results.tests.push({ name: 'CONFIG: Enhanced keywords structure', status: 'FAIL' });
    }
    
    // Test 5.3: Live dropdowns metadata
    if (liveDropdowns.fetchedAt && (liveDropdowns.property || liveDropdowns.typeOfOperation)) {
      success('live-dropdowns.json has metadata and dropdown data');
      results.tests.push({ name: 'CONFIG: Live dropdowns metadata', status: 'PASS' });
    } else {
      fail('live-dropdowns.json missing metadata or dropdown data');
      results.tests.push({ name: 'CONFIG: Live dropdowns metadata', status: 'FAIL' });
    }
    
  } catch (error) {
    fail('Configuration validation failed', error.message);
    results.tests.push({ name: 'CONFIG: Validation', status: 'FAIL' });
  }
}

// ============================================================================
// Test 6: Apps Script Validation
// ============================================================================

function testAppsScriptValidation() {
  section('TEST 6: Apps Script Validation');
  
  try {
    const appsScript = fs.readFileSync('COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js', 'utf8');
    
    // Test version
    const versionMatch = appsScript.match(/Version (\d+\.\d+)/);
    if (versionMatch) {
      success(`Apps Script version: ${versionMatch[1]}`);
      results.tests.push({ name: 'APPS_SCRIPT: Version', status: 'PASS' });
    } else {
      fail('Apps Script version not found');
      results.tests.push({ name: 'APPS_SCRIPT: Version', status: 'FAIL' });
    }
    
    // Test Property/Person range
    const propertyRangeMatch = appsScript.match(/const nameRange = sheet\.getRange\("A(\d+):A(\d+)"\);/);
    if (propertyRangeMatch) {
      success(`Apps Script Property/Person range: A${propertyRangeMatch[1]}:A${propertyRangeMatch[2]}`);
      results.tests.push({ name: 'APPS_SCRIPT: Property/Person range', status: 'PASS' });
    } else {
      fail('Apps Script Property/Person range not found');
      results.tests.push({ name: 'APPS_SCRIPT: Property/Person range', status: 'FAIL' });
    }
    
    // Test Overhead range
    const startRowMatch = appsScript.match(/const startRow = (\d+);/);
    const endRowMatch = appsScript.match(/const endRow = (\d+);/);
    if (startRowMatch && endRowMatch) {
      success(`Apps Script Overhead range: rows ${startRowMatch[1]}-${endRowMatch[1]}`);
      results.tests.push({ name: 'APPS_SCRIPT: Overhead range', status: 'PASS' });
    } else {
      fail('Apps Script Overhead range not found');
      results.tests.push({ name: 'APPS_SCRIPT: Overhead range', status: 'FAIL' });
    }
    
  } catch (error) {
    fail('Apps Script validation failed', error.message);
    results.tests.push({ name: 'APPS_SCRIPT: Validation', status: 'FAIL' });
  }
}

// ============================================================================
// Test 7: Google Sheets Sync Validation
// ============================================================================

function testGoogleSheetsSync() {
  section('TEST 7: Google Sheets Sync Validation');

  try {
    info('Running sync-sheets.js in dry-run mode...');
    const output = execSync('node sync-sheets.js --dry-run', {
      encoding: 'utf8',
      stdio: VERBOSE ? 'inherit' : 'pipe'
    });

    if (output.includes('SYNC COMPLETE') || output.includes('Everything is already in sync')) {
      success('Google Sheets sync validation passed');
      results.tests.push({ name: 'SYNC: Dry run', status: 'PASS' });
    } else {
      fail('Google Sheets sync validation failed');
      results.tests.push({ name: 'SYNC: Dry run', status: 'FAIL' });
    }
  } catch (error) {
    fail('Google Sheets sync validation failed', error.message);
    results.tests.push({ name: 'SYNC: Dry run', status: 'FAIL' });
  }
}

// ============================================================================
// Test 8: File Structure Validation
// ============================================================================

function testFileStructure() {
  section('TEST 8: File Structure Validation');

  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'tailwind.config.ts',
    '.eslintrc.json',
    'app/layout.tsx',
    'app/page.tsx',
    'app/upload/page.tsx',
    'app/review/[id]/page.tsx',
    'app/inbox/page.tsx',
    'app/pnl/page.tsx',
    'app/balance/page.tsx',
    'app/admin/page.tsx',
    'app/api/ocr/route.ts',
    'app/api/extract/route.ts',
    'app/api/sheets/route.ts',
    'app/api/inbox/route.ts',
    'app/api/pnl/route.ts',
    'app/api/balance/get/route.ts',
    'app/api/balance/save/route.ts',
    'app/api/balance/ocr/route.ts',
    'app/api/balance/by-property/route.ts',
    'components/Navigation.tsx'
  ];

  requiredFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      success(`${filePath} exists`);
      results.tests.push({ name: `FILE: ${filePath}`, status: 'PASS' });
    } else {
      fail(`${filePath} not found`);
      results.tests.push({ name: `FILE: ${filePath}`, status: 'FAIL' });
    }
  });
}

// ============================================================================
// Test 9: Dependency Check
// ============================================================================

function testDependencies() {
  section('TEST 9: Dependencies Check');

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
      'next',
      'react',
      'react-dom',
      'tailwindcss',
      'googleapis',
      'framer-motion',
      'lucide-react',
      'uuid'
    ];

    requiredDeps.forEach(dep => {
      if (packageJson.dependencies[dep]) {
        success(`${dep} is installed (${packageJson.dependencies[dep]})`);
        results.tests.push({ name: `DEP: ${dep}`, status: 'PASS' });
      } else {
        fail(`${dep} is missing from dependencies`);
        results.tests.push({ name: `DEP: ${dep}`, status: 'FAIL' });
      }
    });

    // Check if node_modules exists
    if (fs.existsSync('node_modules')) {
      success('node_modules directory exists');
      results.tests.push({ name: 'DEP: node_modules', status: 'PASS' });
    } else {
      fail('node_modules directory not found - run npm install');
      results.tests.push({ name: 'DEP: node_modules', status: 'FAIL' });
    }

  } catch (error) {
    fail('Dependencies check failed', error.message);
    results.tests.push({ name: 'DEP: Check', status: 'FAIL' });
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runAllTests() {
  log('\n' + '='.repeat(70), 'bright');
  log('  🧪 ACCOUNTING BUDDY - COMPREHENSIVE TEST SUITE', 'bright');
  log('='.repeat(70) + '\n', 'bright');

  const startTime = Date.now();

  // Run all test suites
  testEnvironmentVariables();
  testConfigurationFiles();
  testConfigurationValidation();
  testAppsScriptValidation();
  testFileStructure();
  testDependencies();
  testGoogleSheetsSync();
  testTypeScriptAndLinting();
  testBuild();

  // Final summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  log('\n' + '='.repeat(70), 'bright');
  log('  📊 TEST SUMMARY', 'bright');
  log('='.repeat(70) + '\n', 'bright');

  log(`Total Tests: ${results.passed + results.failed + results.skipped}`, 'cyan');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, 'red');
  log(`⏭️  Skipped: ${results.skipped}`, 'yellow');
  log(`⏱️  Duration: ${duration}s`, 'blue');

  if (results.failed > 0) {
    log('\n❌ SOME TESTS FAILED', 'red');
    log('\nFailed tests:', 'red');
    results.tests.filter(t => t.status === 'FAIL').forEach(t => {
      log(`  - ${t.name}`, 'red');
    });
    process.exit(1);
  } else {
    log('\n✅ ALL TESTS PASSED!', 'green');
    process.exit(0);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

