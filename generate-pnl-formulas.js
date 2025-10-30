/**
 * Generate P&L formulas for new expense categories
 * This script generates SUMIF formulas you can copy-paste into your P&L sheet
 */

const options = require('./config/options.json');

console.log('📊 P&L Formula Generator\n');
console.log('Copy these formulas into your Google Sheet P&L\n');
console.log('=' + '='.repeat(70) + '\n');

// New categories that need to be added to P&L
const newCategories = [
  'EXP - Personal - Massage',
  'EXP - Construction - Electric Supplies ',
  'EXP - Repairs & Maintenance  - Furniture & Decorative Items ',
  'EXP - Repairs & Maintenance - Tools & Equipment ',
  'Revenue - Commision ',
  'Revenue - Sales '
];

console.log('🆕 NEW CATEGORIES TO ADD TO P&L SHEET:\n');

newCategories.forEach((category, index) => {
  const isRevenue = category.startsWith('Revenue');
  const categoryType = isRevenue ? 'REVENUE' : 'EXPENSE';
  
  console.log(`${index + 1}. ${category.trim()}`);
  console.log(`   Type: ${categoryType}`);
  console.log(`   Formula (assuming Transactions sheet):`);
  console.log(`   =SUMIF(Transactions!$C:$C,"${category.trim()}",Transactions!$E:$E)`);
  console.log('');
});

console.log('=' + '='.repeat(70) + '\n');

console.log('📋 ALL EXPENSE CATEGORIES (for reference):\n');

const expenseCategories = options.typeOfOperation.filter(op => op.startsWith('EXP'));
const revenueCategories = options.typeOfOperation.filter(op => op.startsWith('Revenue'));

console.log('EXPENSES:');
expenseCategories.forEach((cat, i) => {
  const isNew = newCategories.includes(cat);
  console.log(`${i + 1}. ${cat} ${isNew ? '🆕' : ''}`);
});

console.log('\nREVENUES:');
revenueCategories.forEach((cat, i) => {
  const isNew = newCategories.includes(cat);
  console.log(`${i + 1}. ${cat} ${isNew ? '🆕' : ''}`);
});

console.log('\n=' + '='.repeat(70) + '\n');

console.log('💡 TIPS FOR UPDATING YOUR P&L SHEET:\n');
console.log('1. Add a new row in your P&L for each new category');
console.log('2. Put the category name in column A (or your label column)');
console.log('3. Put the SUMIF formula in the amount column');
console.log('4. Make sure the formula references match your sheet structure');
console.log('5. Update any total/subtotal formulas to include the new rows\n');

console.log('🔍 EXAMPLE P&L STRUCTURE:\n');
console.log('| Category                     | Formula                                              | Amount |');
console.log('|------------------------------|------------------------------------------------------|--------|');
console.log('| EXPENSES                     |                                                      |        |');
console.log('| EXP - Personal - Massage 🆕  | =SUMIF(Transactions!$C:$C,"EXP - Personal - Massage",Transactions!$E:$E) | 0      |');
console.log('| ...other expenses...         |                                                      |        |');
console.log('| TOTAL EXPENSES               | =SUM(B2:B30)  ← Update range!                       |        |');
console.log('');

console.log('✅ Done! Use these formulas to update your P&L sheet.');
