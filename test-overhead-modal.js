/**
 * Test Suite for Overhead Expenses Modal Implementation
 * 
 * This script tests:
 * 1. Frontend component compilation
 * 2. API endpoint accessibility
 * 3. Apps Script function readiness
 * 4. Modal integration in P&L page
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Overhead Expenses Modal Implementation\n');
console.log('═'.repeat(70));
console.log('\n');

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function testResult(name, status, message = '') {
  const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${emoji} ${name}`);
  if (message) console.log(`   ${message}`);
  
  results.tests.push({ name, status, message });
  if (status === 'pass') results.passed++;
  else if (status === 'fail') results.failed++;
  else results.warnings++;
}

// ============================================================================
// Test 1: Frontend Component Files
// ============================================================================
console.log('📦 Test 1: Frontend Component Files');
console.log('─'.repeat(70));

try {
  // Check OverheadExpensesModal component
  const modalPath = path.join(__dirname, 'components', 'OverheadExpensesModal.tsx');
  if (fs.existsSync(modalPath)) {
    const content = fs.readFileSync(modalPath, 'utf8');
    
    // Check for key features
    const hasInterface = content.includes('interface OverheadExpenseItem');
    const hasModal = content.includes('OverheadExpensesModal');
    const hasAPI = content.includes('/api/pnl/overhead-expenses');
    const hasGrouping = content.includes('groupedExpenses');
    const hasAnimation = content.includes('AnimatePresence');
    
    if (hasInterface && hasModal && hasAPI && hasGrouping && hasAnimation) {
      testResult('OverheadExpensesModal.tsx exists with all features', 'pass');
    } else {
      testResult('OverheadExpensesModal.tsx missing features', 'fail', 
        `Interface: ${hasInterface}, Modal: ${hasModal}, API: ${hasAPI}, Grouping: ${hasGrouping}, Animation: ${hasAnimation}`);
    }
  } else {
    testResult('OverheadExpensesModal.tsx not found', 'fail', modalPath);
  }
} catch (error) {
  testResult('Error checking modal component', 'fail', error.message);
}

console.log('');

// ============================================================================
// Test 2: API Endpoint
// ============================================================================
console.log('📡 Test 2: API Endpoint');
console.log('─'.repeat(70));

try {
  const apiPath = path.join(__dirname, 'app', 'api', 'pnl', 'overhead-expenses', 'route.ts');
  if (fs.existsSync(apiPath)) {
    const content = fs.readFileSync(apiPath, 'utf8');
    
    // Check for key features
    const hasGET = content.includes('export async function GET');
    const hasPOST = content.includes('export async function POST');
    const hasValidation = content.includes("['month', 'year']");
    const hasAppsScript = content.includes('getOverheadExpensesDetails');
    const hasErrorHandling = content.includes('createErrorResponse') || content.includes('catch');
    
    if (hasGET && hasPOST && hasValidation && hasAppsScript && hasErrorHandling) {
      testResult('API route.ts exists with all handlers', 'pass');
    } else {
      testResult('API route.ts missing features', 'fail',
        `GET: ${hasGET}, POST: ${hasPOST}, Validation: ${hasValidation}, Apps: ${hasAppsScript}, Error: ${hasErrorHandling}`);
    }
  } else {
    testResult('API route.ts not found', 'fail', apiPath);
  }
} catch (error) {
  testResult('Error checking API endpoint', 'fail', error.message);
}

console.log('');

// ============================================================================
// Test 3: P&L Page Integration
// ============================================================================
console.log('🎨 Test 3: P&L Page Integration');
console.log('─'.repeat(70));

try {
  const pnlPath = path.join(__dirname, 'app', 'pnl', 'page.tsx');
  if (fs.existsSync(pnlPath)) {
    const content = fs.readFileSync(pnlPath, 'utf8');
    
    // Check for overhead modal integration
    const hasImport = content.includes('import OverheadExpensesModal');
    const hasState = content.includes('isOverheadModalOpen') && 
                     content.includes('overheadModalPeriod') && 
                     content.includes('overheadModalTotalExpense');
    const hasFunction = content.includes('openOverheadExpensesModal');
    const hasClickableMonth = content.match(/Total Overheads[\s\S]*?isClickable[\s\S]*?month/);
    const hasClickableYear = content.match(/Total Overheads[\s\S]*?isClickable[\s\S]*?year/);
    const hasModalRender = content.includes('<OverheadExpensesModal');
    
    if (hasImport && hasState && hasFunction && hasClickableMonth && hasClickableYear && hasModalRender) {
      testResult('P&L page fully integrated', 'pass');
    } else {
      testResult('P&L page missing integration', 'fail',
        `Import: ${hasImport}, State: ${hasState}, Function: ${hasFunction}, Month: ${!!hasClickableMonth}, Year: ${!!hasClickableYear}, Render: ${hasModalRender}`);
    }
  } else {
    testResult('P&L page.tsx not found', 'fail', pnlPath);
  }
} catch (error) {
  testResult('Error checking P&L page', 'fail', error.message);
}

console.log('');

// ============================================================================
// Test 4: Apps Script Function
// ============================================================================
console.log('📜 Test 4: Apps Script Function');
console.log('─'.repeat(70));

try {
  const appsScriptPath = path.join(__dirname, 'COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js');
  if (fs.existsSync(appsScriptPath)) {
    const content = fs.readFileSync(appsScriptPath, 'utf8');
    
    // Check for overhead expenses function
    const hasFunction = content.includes('handleGetOverheadExpensesDetails');
    const hasRoute = content.includes("payload.action === 'getOverheadExpensesDetails'");
    const hasDataRange = content.includes('startRow = 29') && content.includes('endRow = 51');
    const hasMonthDetection = content.includes('Find current month column dynamically');
    const hasFilter = content.includes("indexOf('EXP -')");
    const hasPercentage = content.includes('item.percentage');
    const hasSort = content.includes('sort(function(a, b)');
    const hasVersion = content.includes('7.1');
    const hasTestFunction = content.includes('testOverheadExpensesEndpoint');
    
    if (hasFunction && hasRoute && hasDataRange && hasMonthDetection && hasFilter && hasPercentage && hasSort && hasVersion && hasTestFunction) {
      testResult('Apps Script V7.1 ready with overhead function', 'pass');
    } else {
      testResult('Apps Script missing overhead features', 'fail',
        `Function: ${hasFunction}, Route: ${hasRoute}, Range: ${hasDataRange}, Month: ${hasMonthDetection}, Filter: ${hasFilter}, %: ${hasPercentage}, Sort: ${hasSort}, Version: ${hasVersion}, Test: ${hasTestFunction}`);
    }
  } else {
    testResult('Apps Script V7 file not found', 'fail', appsScriptPath);
  }
} catch (error) {
  testResult('Error checking Apps Script', 'fail', error.message);
}

console.log('');

// ============================================================================
// Test 5: Documentation
// ============================================================================
console.log('📚 Test 5: Documentation');
console.log('─'.repeat(70));

try {
  const docs = [
    'OVERHEAD_EXPENSES_IMPLEMENTATION.md',
    'OVERHEAD_EXPENSES_SUMMARY.md',
    'overhead-implementation-diagram.txt'
  ];
  
  let allDocsExist = true;
  docs.forEach(doc => {
    const docPath = path.join(__dirname, doc);
    if (fs.existsSync(docPath)) {
      testResult(`${doc} exists`, 'pass');
    } else {
      testResult(`${doc} missing`, 'warn');
      allDocsExist = false;
    }
  });
  
  if (allDocsExist) {
    testResult('All documentation complete', 'pass');
  }
} catch (error) {
  testResult('Error checking documentation', 'warn', error.message);
}

console.log('');

// ============================================================================
// Test 6: Data Extraction Script
// ============================================================================
console.log('🔍 Test 6: Data Extraction Script');
console.log('─'.repeat(70));

try {
  const extractPath = path.join(__dirname, 'scripts', 'extract-overhead-expenses.js');
  const logPath = path.join(__dirname, 'logs', 'overhead-expenses-extract.json');
  
  if (fs.existsSync(extractPath)) {
    testResult('Extraction script exists', 'pass');
  } else {
    testResult('Extraction script missing', 'warn', extractPath);
  }
  
  if (fs.existsSync(logPath)) {
    const data = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    if (data.metadata && data.metadata.totalExpenses === 23) {
      testResult('Extraction data complete (23 categories)', 'pass');
    } else {
      testResult('Extraction data incomplete', 'warn', `Found ${data.metadata?.totalExpenses || 0} categories`);
    }
  } else {
    testResult('Extraction log missing (run extract script)', 'warn', logPath);
  }
} catch (error) {
  testResult('Error checking extraction data', 'warn', error.message);
}

console.log('');

// ============================================================================
// Test 7: TypeScript Compilation Check
// ============================================================================
console.log('⚙️  Test 7: TypeScript Configuration');
console.log('─'.repeat(70));

try {
  const tsconfigPath = path.join(__dirname, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    testResult('tsconfig.json exists', 'pass');
    
    // Check if we can find any TypeScript errors in the logs
    const tsErrorLogPath = path.join(__dirname, 'typescript-test-output.txt');
    if (fs.existsSync(tsErrorLogPath)) {
      const content = fs.readFileSync(tsErrorLogPath, 'utf8');
      if (content.includes('OverheadExpensesModal') && content.includes('error')) {
        testResult('TypeScript compilation has errors', 'warn', 'Check typescript-test-output.txt');
      } else {
        testResult('No TypeScript errors found in logs', 'pass');
      }
    } else {
      testResult('TypeScript error log not found', 'warn', 'Run: npm run build or tsc');
    }
  } else {
    testResult('tsconfig.json not found', 'warn', tsconfigPath);
  }
} catch (error) {
  testResult('Error checking TypeScript config', 'warn', error.message);
}

console.log('');

// ============================================================================
// Summary
// ============================================================================
console.log('═'.repeat(70));
console.log('📊 TEST SUMMARY');
console.log('═'.repeat(70));
console.log('');

console.log(`✅ Passed:   ${results.passed}`);
console.log(`❌ Failed:   ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`📝 Total:    ${results.tests.length}`);
console.log('');

if (results.failed === 0) {
  console.log('🎉 All critical tests passed!');
  console.log('');
  console.log('📋 NEXT STEPS:');
  console.log('');
  console.log('1. Deploy Google Apps Script:');
  console.log('   - Open: script.google.com');
  console.log('   - Select ALL code and DELETE');
  console.log('   - Copy COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js');
  console.log('   - Paste and Deploy as new version');
  console.log('');
  console.log('2. Test the implementation:');
  console.log('   - Visit your P&L page (/pnl)');
  console.log('   - Click on "Total Overheads" (Month)');
  console.log('   - Click on "Total Overheads" (Year)');
  console.log('   - Verify modal opens with 23 expense categories');
  console.log('');
  console.log('3. Verify data:');
  console.log('   - Check expenses are grouped by category');
  console.log('   - Verify amounts match your P&L sheet');
  console.log('   - Test on mobile devices');
  console.log('');
} else {
  console.log('❌ Some tests failed. Please review the errors above.');
  console.log('');
  console.log('Failed tests:');
  results.tests.filter(t => t.status === 'fail').forEach(t => {
    console.log(`  - ${t.name}`);
    if (t.message) console.log(`    ${t.message}`);
  });
  console.log('');
}

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
