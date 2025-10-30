/**
 * Diagnose P&L Named Ranges and Cell Values
 * This script checks the Google Sheet to verify:
 * 1. Named ranges are pointing to correct cells
 * 2. What values are in those cells
 * 3. What formulas are in those cells
 * 4. What the overhead expense rows (29-51) actually contain
 */

require('dotenv').config({ path: '.env.local' });

const APPS_SCRIPT_URL = process.env.SHEETS_PNL_URL || process.env.APPS_SCRIPT_URL;
const SECRET = process.env.SHEETS_WEBHOOK_SECRET || process.env.APPS_SCRIPT_SECRET;

if (!APPS_SCRIPT_URL || !SECRET) {
  console.error('❌ Missing environment variables');
  console.error('Need: SHEETS_PNL_URL (or APPS_SCRIPT_URL) and SHEETS_WEBHOOK_SECRET (or APPS_SCRIPT_SECRET)');
  process.exit(1);
}

async function diagnoseRanges() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 P&L NAMED RANGES DIAGNOSTIC');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Step 1: Check named ranges
    console.log('📋 Step 1: Checking Named Ranges...\n');
    
    const rangesResponse = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'list_named_ranges',
        secret: SECRET
      })
    });

    if (!rangesResponse.ok) {
      throw new Error(`HTTP ${rangesResponse.status}: ${rangesResponse.statusText}`);
    }

    const rangesData = await rangesResponse.json();
    
    if (!rangesData.ok) {
      throw new Error(rangesData.error || 'Failed to fetch named ranges');
    }

    console.log(`✓ Found ${rangesData.totalRanges} total named ranges`);
    console.log(`✓ Found ${rangesData.pnlRelatedCount} P&L-related ranges\n`);

    // Display each named range
    rangesData.pnlRelated.forEach(range => {
      console.log(`📌 ${range.name}`);
      console.log(`   Cell: ${range.sheet}!${range.a1}`);
      console.log(`   Value: ${range.value} (${range.type})`);
      console.log('');
    });

    // Step 2: Check P&L data
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 Step 2: Checking P&L Data...\n');

    const pnlResponse = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getPnL',
        secret: SECRET
      })
    });

    if (!pnlResponse.ok) {
      throw new Error(`HTTP ${pnlResponse.status}: ${pnlResponse.statusText}`);
    }

    const pnlData = await pnlResponse.json();

    if (!pnlData.ok) {
      throw new Error(pnlData.error || 'Failed to fetch P&L data');
    }

    console.log('📈 Month to Date:');
    console.log(`   Revenue: ฿${pnlData.data.month.revenue.toLocaleString()}`);
    console.log(`   Overheads: ฿${pnlData.data.month.overheads.toLocaleString()} ← ${pnlData.data.month.overheads === 0 ? '❌ ZERO!' : '✓'}`);
    console.log(`   Property/Person: ฿${pnlData.data.month.propertyPersonExpense.toLocaleString()}`);
    console.log(`   GOP: ฿${pnlData.data.month.gop.toLocaleString()}`);
    console.log(`   EBITDA: ${pnlData.data.month.ebitdaMargin.toFixed(2)}%`);
    console.log('');

    console.log('📊 Year to Date:');
    console.log(`   Revenue: ฿${pnlData.data.year.revenue.toLocaleString()}`);
    console.log(`   Overheads: ฿${pnlData.data.year.overheads.toLocaleString()} ← ${pnlData.data.year.overheads === 0 ? '❌ ZERO!' : '✓'}`);
    console.log(`   Property/Person: ฿${pnlData.data.year.propertyPersonExpense.toLocaleString()}`);
    console.log(`   GOP: ฿${pnlData.data.year.gop.toLocaleString()}`);
    console.log(`   EBITDA: ${pnlData.data.year.ebitdaMargin.toFixed(2)}%`);
    console.log('');

    if (pnlData.warnings && pnlData.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      pnlData.warnings.forEach(w => console.log(`   - ${w}`));
      console.log('');
    }

    // Step 3: Check overhead expenses details
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('💰 Step 3: Checking Overhead Expenses Details...\n');

    const overheadMonthResponse = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getOverheadExpensesDetails',
        secret: SECRET,
        period: 'month'
      })
    });

    const overheadMonthData = await overheadMonthResponse.json();

    if (overheadMonthData.ok) {
      console.log('📅 Month Overhead Expenses:');
      console.log(`   Total: ฿${overheadMonthData.totalExpense.toLocaleString()}`);
      console.log(`   Items: ${overheadMonthData.count}`);
      console.log(`   Range: ${overheadMonthData.range}`);
      console.log(`   Column: ${overheadMonthData.column}`);
      console.log('');
      
      // Show non-zero expenses
      const nonZeroExpenses = overheadMonthData.data.filter(item => item.expense > 0);
      if (nonZeroExpenses.length > 0) {
        console.log('   Non-zero expenses:');
        nonZeroExpenses.forEach(item => {
          console.log(`   - ${item.name}: ฿${item.expense.toLocaleString()}`);
        });
      } else {
        console.log('   (No non-zero expenses found)');
      }
      console.log('');
    }

    // Analysis
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔬 ANALYSIS\n');

    const monthOverheadFromNamedRange = pnlData.data.month.overheads;
    const monthOverheadFromDetails = overheadMonthData.ok ? overheadMonthData.totalExpense : null;

    if (monthOverheadFromNamedRange === 0 && monthOverheadFromDetails > 0) {
      console.log('❌ PROBLEM DETECTED:');
      console.log(`   Named range "Month_Total_Overheads" returns: ฿${monthOverheadFromNamedRange}`);
      console.log(`   But sum of overhead expenses (rows 29-51) is: ฿${monthOverheadFromDetails}`);
      console.log('');
      console.log('💡 LIKELY CAUSE:');
      console.log(`   Cell N46 (Month_Total_Overheads) doesn't have the correct formula.`);
      console.log(`   It should contain: =SUM(N29:N51)`);
      console.log('');
      console.log('🔧 FIX REQUIRED:');
      console.log('   1. Open Google Sheet: "P&L (DO NOT EDIT)"');
      console.log('   2. Go to cell N46');
      console.log('   3. Check if it has a formula');
      console.log('   4. If not, add: =SUM(N29:N51)');
      console.log('   5. Repeat for Q46 (Year): =SUM(Q29:Q51)');
      console.log('');
    } else if (monthOverheadFromNamedRange === monthOverheadFromDetails) {
      console.log('✅ WORKING CORRECTLY:');
      console.log(`   Named range and detail sum both show: ฿${monthOverheadFromNamedRange}`);
      console.log('');
    } else {
      console.log('⚠️  UNEXPECTED RESULT:');
      console.log(`   Named range: ฿${monthOverheadFromNamedRange}`);
      console.log(`   Detail sum: ฿${monthOverheadFromDetails}`);
      console.log('');
    }

    // Check year as well
    const yearOverheadFromNamedRange = pnlData.data.year.overheads;
    
    const overheadYearResponse = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getOverheadExpensesDetails',
        secret: SECRET,
        period: 'year'
      })
    });

    const overheadYearData = await overheadYearResponse.json();
    const yearOverheadFromDetails = overheadYearData.ok ? overheadYearData.totalExpense : null;

    if (yearOverheadFromNamedRange === 0 && yearOverheadFromDetails > 0) {
      console.log('❌ YEAR PROBLEM DETECTED:');
      console.log(`   Named range "Year_Total_Overheads" returns: ฿${yearOverheadFromNamedRange}`);
      console.log(`   But sum of overhead expenses (column Q, rows 29-51) is: ฿${yearOverheadFromDetails}`);
      console.log('');
      console.log('🔧 FIX REQUIRED:');
      console.log('   Cell Q46 should contain: =SUM(Q29:Q51)');
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Diagnostic Complete');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    process.exit(1);
  }
}

// Run the diagnostic
diagnoseRanges();
