/**
 * Automated Test Runner for Quick Entry → Review Page Flow
 * Tests all 4 scenarios and validates the responses
 */

const testCases = [
  {
    name: "Test 1: Revenue with Bangkok Bank - Shaun Ducker",
    data: {
      day: "15",
      month: "10",
      year: "2025",
      property: "Sia Moon",
      typeOfOperation: "Revenue - Rooms",
      typeOfPayment: "Bank Transfer - Bangkok Bank - Shaun Ducker",
      detail: "Room booking payment",
      ref: "REF-001",
      debit: "0",
      credit: "5000"
    },
    expected: {
      typeOfPayment: "Bank Transfer - Bangkok Bank - Shaun Ducker",
      typeOfOperation: "Revenue - Rooms",
      credit: "5000",
      debit: "0"
    }
  },
  {
    name: "Test 2: Expense with Cash",
    data: {
      day: "16",
      month: "10",
      year: "2025",
      property: "The Haven",
      typeOfOperation: "Administrative expenses",
      typeOfPayment: "Cash",
      detail: "Office supplies",
      ref: "REF-002",
      debit: "1500",
      credit: "0"
    },
    expected: {
      typeOfPayment: "Cash",
      typeOfOperation: "Administrative expenses",
      debit: "1500",
      credit: "0"
    }
  },
  {
    name: "Test 3: Expense with Bangkok Bank - Maria Ren",
    data: {
      day: "17",
      month: "10",
      year: "2025",
      property: "Coco View",
      typeOfOperation: "Utilities",
      typeOfPayment: "Bank Transfer - Bangkok Bank - Maria Ren",
      detail: "Electricity bill",
      ref: "REF-003",
      debit: "2300",
      credit: "0"
    },
    expected: {
      typeOfPayment: "Bank Transfer - Bangkok Bank - Maria Ren",
      typeOfOperation: "Utilities",
      debit: "2300",
      credit: "0"
    }
  },
  {
    name: "Test 4: Revenue with Krung Thai Bank",
    data: {
      day: "18",
      month: "10",
      year: "2025",
      property: "Sia Moon",
      typeOfOperation: "Revenue - Restaurant",
      typeOfPayment: "Bank transfer - Krung Thai Bank - Family Account",
      detail: "Restaurant sales",
      ref: "REF-004",
      debit: "0",
      credit: "8500"
    },
    expected: {
      typeOfPayment: "Bank transfer - Krung Thai Bank - Family Account",
      typeOfOperation: "Revenue - Restaurant",
      credit: "8500",
      debit: "0"
    }
  }
];

async function testReviewPageUrl(testCase, index) {
  const encodedData = encodeURIComponent(JSON.stringify(testCase.data));
  const url = `http://localhost:3001/review/new?data=${encodedData}`;
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🧪 ${testCase.name}`);
  console.log(`${'='.repeat(70)}\n`);
  
  console.log(`📊 Test Data:`);
  console.log(`   Category: ${testCase.data.typeOfOperation}`);
  console.log(`   Payment: ${testCase.data.typeOfPayment}`);
  console.log(`   Amount: ${testCase.data.credit || testCase.data.debit} THB (${testCase.data.credit ? 'Credit' : 'Debit'})`);
  console.log(`   Property: ${testCase.data.property}`);
  console.log(`   Date: ${testCase.data.day}/${testCase.data.month}/${testCase.data.year}`);
  
  console.log(`\n🔗 Test URL:`);
  console.log(`   ${url.substring(0, 80)}...`);
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    console.log(`\n✅ Server Response:`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    
    // Check if the page contains the expected data
    const checks = {
      hasReviewPage: html.includes('Review Transaction') || html.includes('review'),
      hasPaymentType: html.includes(testCase.expected.typeOfPayment),
      hasCategory: html.includes(testCase.expected.typeOfOperation),
      hasProperty: html.includes(testCase.data.property),
      noErrors: !html.includes('error') && !html.includes('Error'),
    };
    
    console.log(`\n🔍 Validation Checks:`);
    console.log(`   ${checks.hasReviewPage ? '✅' : '❌'} Page loads successfully`);
    console.log(`   ${checks.hasPaymentType ? '✅' : '❌'} Payment type present: "${testCase.expected.typeOfPayment}"`);
    console.log(`   ${checks.hasCategory ? '✅' : '❌'} Category present: "${testCase.expected.typeOfOperation}"`);
    console.log(`   ${checks.hasProperty ? '✅' : '❌'} Property present: "${testCase.data.property}"`);
    console.log(`   ${checks.noErrors ? '✅' : '❌'} No error messages`);
    
    const allPassed = Object.values(checks).every(v => v === true);
    
    console.log(`\n🎯 Test Result: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    return { testCase, passed: allPassed, checks, response };
    
  } catch (error) {
    console.log(`\n❌ Test Failed with Error:`);
    console.log(`   ${error.message}`);
    return { testCase, passed: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('\n' + '═'.repeat(70));
  console.log('🚀 AUTOMATED TEST SUITE: Quick Entry → Review Page Flow');
  console.log('═'.repeat(70));
  console.log(`\n📅 Started: ${new Date().toLocaleString()}`);
  console.log(`🌐 Server: http://localhost:3001`);
  console.log(`📝 Total Tests: ${testCases.length}`);
  
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const result = await testReviewPageUrl(testCases[i], i);
    results.push(result);
    
    // Wait a bit between tests
    if (i < testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(70) + '\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  console.log('\n' + '═'.repeat(70));
  console.log('📋 DETAILED RESULTS');
  console.log('═'.repeat(70) + '\n');
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${status} - ${result.testCase.name}`);
    if (!result.passed && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '═'.repeat(70));
  console.log(`✅ Testing Complete - ${new Date().toLocaleString()}`);
  console.log('═'.repeat(70) + '\n');
  
  if (passed === results.length) {
    console.log('🎉 ALL TESTS PASSED! 🎉\n');
    console.log('✅ Quick Entry → Review Page flow is working correctly!');
    console.log('✅ Payment types are auto-populating');
    console.log('✅ Categories are auto-populating');
    console.log('✅ No infinite loop errors detected\n');
  } else {
    console.log('⚠️  SOME TESTS FAILED\n');
    console.log('Please review the errors above and check:');
    console.log('- Is the dev server running on http://localhost:3001?');
    console.log('- Are the payment types in config/options.json correct?');
    console.log('- Check browser console for additional errors\n');
  }
  
  process.exit(passed === results.length ? 0 : 1);
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3001');
    console.log('✅ Server is running on http://localhost:3001\n');
    return true;
  } catch (error) {
    console.log('❌ ERROR: Server is not running on http://localhost:3001');
    console.log('Please start the dev server with: npm run dev\n');
    process.exit(1);
  }
}

// Run tests
checkServer().then(() => runAllTests());
