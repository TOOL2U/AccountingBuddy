/**
 * Call Apps Script directly to see what range it reports
 */

require('dotenv').config({ path: '.env.local' });

const APPS_SCRIPT_URL = process.env.SHEETS_PNL_URL || process.env.APPS_SCRIPT_URL;
const SECRET = process.env.SHEETS_WEBHOOK_SECRET || process.env.APPS_SCRIPT_SECRET;

async function checkRange() {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getOverheadExpensesDetails',
        secret: SECRET,
        period: 'month'
      })
    });

    const data = await response.json();
    
    console.log('Apps Script Response:');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('Range:', data.range);
    console.log('Column:', data.column);
    console.log('Total Expense:', data.totalExpense);
    console.log('Count:', data.count);
    console.log('\nData items with values:');
    
    data.data?.filter(item => item.expense > 0).forEach(item => {
      console.log(`  - ${item.name}: ฿${item.expense}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkRange();
